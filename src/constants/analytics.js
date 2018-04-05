export const ANALYTICS = ""
  //analytics constants
export const DIMENSIONS_METRICS_FRIENDLY_NAME = {
  //dimensions
  "ga:landingPagePath": "Landing Page",
  "ga:pagePath": "Page",
  "ga:pageTitle": "Page Title",
  "ga:channelGrouping": "Channel Grouping",
  "ga:keyword": "Keyword",
  //metrics
  "ga:pageviews": "Page Views",
  "ga:sessions": "Sessions",
  "ga:users": "Users",
  "ga:uniquePageviews": "Unique Page Views",
  "ga:bounceRate": "Bounce Rate",
  "ga:avgSessionDuration": "Average Session Duration",
  "ga:avgTimeOnPage": "Average Time on Page",
  "ga:avgPageLoadTime": "Average Page Load Time (sec)",
  "ga:exitRate": "Exit Rate",
  "ga:source": "Source",

  /////////////////////////
  //gsc

  //dimensions
  "query": "Keyword",
  "page": "Landing Page",
  //metrics
  "clicks": "Clicks",
  "impressions": "Impressions",
  "ctr": "Click Through Rate",
  "position": "Position",
}
export const DIMENSIONS_WITH_PATHS = [
  "ga:landingPagePath",
  "ga:pagePath",
  //hacked so is a path, not full url
  "page",
]
