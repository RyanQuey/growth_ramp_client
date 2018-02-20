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
    if (filterLength < 10) {
      unit = "Day"
      step = 1

    } else if (filterLength < 50) {
      unit = "Week"
      step = 1

    } else if (filterLength < 42) {
      unit = "Month"
      step = 1

    } else {
      unit = "Year"
      step = 1
    }

    const range = moment.range(start, end)
    const rangeArray = Array.from(range.by(unit, {step: step}))
    return {rangeArray, unit, step}
  },

  getHistogramLabels: ({rangeArray, unit, step}, rows) => {
    const range = [...rangeArray]

    let formatString
    if (unit === "Year") {
      formatString = "YYYY"
    } else if (unit === "Month") {
      formatString = "MMM"
    } else if (unit === "Week") {
      formatString = "ddd M/D "
    } else if (unit === "Day") {
      formatString = "ddd M/D"
    }

    const initialIndex = rows[0].dimensions[0]

    const labels = range.map((date, index) => {

      if ((step > 1 || unit === "week") && index !== range.length -1) {
        //label should reflect that this is date range
        return `${date.format(formatString)} - ${range[index+1].format(formatString)}`
      } else if ((step > 1) && index !== range.length -1){
        //is the last of the set
        return `${date.format(formatString)} - ${date.clone().add(step, unit).format(formatString)}`
      } else {
        return `${date.format(formatString)}`
      }
    })

    return labels
  }
}
