export default {
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
  }
}
