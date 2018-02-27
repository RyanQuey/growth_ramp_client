import urlLib from 'url'

const analyticsHelpers = {
  //currently based solely on dates of data given
  //goal is to have 4-6 labels
  //NOTE keep in sync between frontend and api
  getXAxisData: ({startDate, endDate}) => {
    const start = moment(startDate)
    const end = moment(endDate)
    //diff in days
    const filterLength = end.diff(start) / 1000 / 60 / 60 / 24

    let unit, step
    if (filterLength < 30) {
      unit = "Day" //titlecase required for GA
      step = 1

    } else if (filterLength < 30 * 7) {
      unit = "Week"
      step = 1

    } else if (filterLength < 30 * 30) {
      //GA doesn't increment by nthYears
      unit = "Month"
      step = 1

    } else {
      unit = "Month" //TODO not entirely accurate, because doesn't do beginning of year until end of year logic in GA for years. Need to change to just display sample times along the bottom
      step = 12
    }

    const range = moment.range(start, end)
    const rangeArray = Array.from(range.by(unit, {step: step}))
    return {rangeArray, unit, step, endDate: end, startDate: start}
  },

  getHistogramLabels: (xAxisData, rows) => {
    let {rangeArray, unit, step, endDate} = xAxisData

    const range = [...rangeArray]
    unit = unit.toLowerCase()

    let formatString
    if (unit === "year") {
      formatString = "YYYY"
    } else if (unit === "month") {
      formatString = "MMM 'YY"
    } else if (unit === "week") {
      formatString = "ddd M/D "
    } else if (unit === "day") {
      formatString = "ddd M/D"
    }

    const initialIndex = rows[0].dimensions[0]

    const labels = range.map((date, index) => {
      const isRangeOfDates = (step > 1 || unit === "week")
      // if isRangeOfDates, label should reflect that this is date range
      if (isRangeOfDates && index !== range.length -1 && index !== 0) {
        // is range and not first of last range
        return `${date.clone().startOf(unit).format(formatString)} - ${date.clone().endOf(unit).format(formatString)}`
      } else if (isRangeOfDates && index === 0){
        //is the last of the set
        return `${date.format(formatString)} - ${date.clone().endOf(unit).format(formatString)}`
      } else if (isRangeOfDates && index === range.length -1){
        //is the last of the set
        return `${date.clone().startOf(unit).format(formatString)} - ${endDate.clone().format(formatString)}`
      } else {
        return `${date.format(formatString)}`
      }
    })

    return labels
  },

  // probably only use query for webpage filter, since that is nice to be able to get to via url
  addQueryToFilters: (filtersObj, targetApis) => {
    const query = new URLSearchParams(document.location.search)
    const webpageQueryValue = query.get("webpage")

    if (webpageQueryValue) {
      // will override any current dimensionFilterClauses. And that's fine with me :)...for now

      if (targetApis.includes("GoogleAnalytics")) {
        filtersObj.dimensionFilterClauses = {
          operator: "AND",
          filters: [
            {
              dimensionName: "ga:landingPagePath",
              operator: "PARTIAL", // this should get all for this landing page, including those with crazy queries eg /blogpost?whatever=stuff
              expressions: [webpageQueryValue],
            }
          ]
        }
      }
      if (targetApis.includes("GoogleSearchConsole")) {
        filtersObj.dimensionFilterGroups = [{
          groupType: "and",
          filters: [
            {
              dimension: "page",
              operator: "contains", // this should get all for this landing page, including those with crazy queries eg /blogpost?whatever=stuff
              expression: webpageQueryValue,
            }
          ]
        }]
      }
    }

    // filtersObj now modified if needed to
  },

  getDataset: (displayType, filters, baseOrganization) => {
    const tableDatasetParams = Helpers.safeDataPath(store.getState(), "forms.Analytics.tableDataset.params", {})

    let datasetArr = [displayType]
    if (displayType === "chart") {
      datasetArr.push("line") //displayStyle
      datasetArr.push("time") // xAxis

    } else if (displayType === "table") {
      // get what the rows will be organized by
      let rowsOrganizedBy
      const query = new URLSearchParams(document.location.search)
      const webpageQueryValue = query.get("webpage")
      if (!tableDatasetParams.rowsBy) {
        // use defaults based on baseOrganization
        let defaultRowsForBaseOrganization = baseOrganization === "landing-pages" && !webpageQueryValue ? "landingPagePath" : "channelGrouping"
        rowsOrganizedBy = Helpers.safeDataPath(filters, `dimensions.0.name`, defaultRowsForBaseOrganization).replace("ga:", "")

      } else {
        rowsOrganizedBy = tableDatasetParams.rowsBy
      }
      datasetArr.push(rowsOrganizedBy)

      let columnSets = []
      if (!tableDatasetParams.columnSets || !tableDatasetParams.columnSets.length ) {
        // use defaults based on baseOrganization
        columnSets.push("behavior")

      } else {
        columnSets = tableDatasetParams.columnSets
      }
      let columnSetsStr = columnSets.join(",")
      datasetArr.push(columnSetsStr)
    }

    const dataset = datasetArr.join("-")
    return dataset
  },

  // Google analytics uses bare bones http url and with no subdomain for its property
  // GSC uses https (if applicable) and can be with subdomain
  // for now, will automatically guess the GSC siteUrl from the GA property, though later might let them choose what GA property defaults to what gsc siteURL
  // keep in sync with backend
  getGSCUrlFromGAUrl: (gaUrl, gscSites) => {
    const parsedUrl = urlLib.parse(gaUrl)
    const hostname = parsedUrl.hostname
    const parts = hostname.split(".")

    //take only the last two parts to get TLD and no subdomain
    const tld = parts.pop()
    const domain = parts.pop()

    const gscUrls = Object.keys(gscSites)

    let matches = gscUrls.filter(url => url.includes(domain))

    let match
    if (matches.length === 1) {
      match = matches[0]

    } else if (matches.length === 0) {
      return //nothing for now

    } else if (matches.length > 1) {
      let closerMatches = gscUrls.filter(url => url.includes(`${domain}.${tld}`))

      if (closerMatches.length === 1) {
        match = closerMatches[0]

      } else if (closerMatches.length === 0) {
        return matches[0]

      } else if (closerMatches.length > 1) {
        match = closerMatches[0]

      }
    }

    return match
  },

  // takes dataset string and parses to get relevant data
  // keep in sync with frontend helper
  parseDataset: (dataset) => {
    const datasetParts = dataset.split("-")
    const displayType = datasetParts[0]

    let rowsBy, columnSetsArr, xAxisBy
    if (displayType === "table") {
      rowsBy = datasetParts[1] || ""
      const columnSetsStr = datasetParts[2] || ""
      columnSetsArr = columnSetsStr.split(",") || []

    } else if (displayType === "table") {
      xAxisBy = datasetParts[1] || ""
    }

    return {datasetParts, displayType, rowsBy, xAxisBy, columnSetsArr}
  },

  // takes dataset info and returns which api will be requested
  // keep in sync with frontend helper
  whomToAsk: (dataset) => {
    const {datasetParts, displayType, rowsBy, xAxisBy, columnSetsArr} = analyticsHelpers.parseDataset(dataset)
    const ret = []

    if (displayType === "table") {
      if (!rowsBy.includes("keyword")) {
        ret.push("GoogleAnalytics")
      } else {
        ret.push("GoogleSearchConsole")
      }
    } else if (displayType === "chart") {
//TODO fix for GSC later
        ret.push("GoogleAnalytics")

    }

    return ret
  },

  // checks with analytics apis to see if user has access, and gets other info needed for the external api
  // wrapper around several other helpers
  getExternalApiInfo: (gaUrl, dataset, websites) => {
    const targetApis = analyticsHelpers.whomToAsk(dataset)
    let gscStatus = {status: "ready", message: ""}

    let gscUrl
    if (targetApis.includes("GoogleSearchConsole")) {
      // check if they have gsc setup with this google acct
      gscUrl = analyticsHelpers.getGSCUrlFromGAUrl(gaUrl, websites.gscSites)
      let gscUrlData = gscUrl && websites.gscSites[gscUrl]

      if (gscUrlData && ["siteOwner", "siteRestrictedUser", "siteFullUser"].includes(gscUrlData.permissionLevel)) {
        // we are currently read-only, so any of these are sufficient
        gscStatus.status = "ready"

      } else if (!gscUrlData) {
        // website is not registered with the google accts GR has access to
        gscStatus.status = "not-found"
        gscStatus.message = `Google Search Console has not been setup for ${gaUrl} with any of the Google accounts you have linked to Growth Ramp. Link a new Google account that has permission to use Google Search Console for ${gaUrl} or get permission with one of your currently linked Google accounts`

      } else if (["siteUnverifiedUser"].includes(gscUrlData.permissionLevel)) {
        // they registered, but don't have any permissions, so need to get that
        // find out which Google acct has it registered
        let allProviderAccts = Helpers.flattenProviderAccounts()
        let linkedAccount = allProviderAccts.find((acct) => acct.id === gscUrlData.providerAccountId)
        let acctUsername = linkedAccount.userName || linkedAccount.email

        gscStatus.status = "unverified"
        gscStatus.message = `Google Search Console has been setup for ${gaUrl} with your Google account ${acctUsername}. Verify ${gaUrl} with ${acctUsername} to get stats and actionable info from your keyword data.`
      }
    }

    return {gscStatus, gscUrl, targetApis}
  },
}

export default analyticsHelpers
