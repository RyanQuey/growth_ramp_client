

export const UTM_TYPES = [
  {label: "Medium", value: "mediumUtm"},
  {label: "Source", value: "sourceUtm"},
  {label: "Content", value: "contentUtm"},
  {label: "Term", value: "termUtm"},
  {label: "Custom", value: "customUtm"},
]

// Using this as a referewnce: https://stackoverflow.com/questions/15275445/length-of-goo-gl-urls
// and counting google links, it appears that twitter always has it at 20 characters, and google is maybe even 21, maybe 13, maybe 19...just stick to 21, maybe even 21, if including https:// for all, to be safe

export const URL_LENGTH = 21
