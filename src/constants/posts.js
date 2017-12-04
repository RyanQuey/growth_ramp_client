

export const UTM_TYPES = [
  {label: "Medium", type: "mediumUtm"},
  {label: "Source", type: "sourceUtm"},
  {label: "Content", type: "contentUtm"},
  {label: "Campaign", type: "campaignUtm"},
  {label: "Term", type: "termUtm"},
  {label: "Custom", type: "customUtm"},
]

// Using this as a referewnce: https://stackoverflow.com/questions/15275445/length-of-goo-gl-urls
// and counting google links, it appears that twitter always has it at 20 characters, and google is maybe even 21, maybe 13, maybe 19...just stick to 21, maybe even 21, if including https:// for all, to be safe

export const URL_LENGTH = 21
