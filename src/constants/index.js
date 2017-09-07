// Social contants
export const PROVIDERS = {
  FACEBOOK: 'facebook',
  //GITHUB: 'github',
  GOOGLE: 'google',
  LINKEDIN: 'linkedIn',
  TWITTER: 'twitter',
  //REDDIT: 'reddit',
}

//maps provider IDs provided by firebase
export const PROVIDER_IDS_MAP = {
  'facebook.com': 'facebook',
  //GITHUB: 'github',
  'google.com': 'google',
  'linkedin.com': 'linkedIn',
  'twitter.com': 'twitter',
  //REDDIT: 'reddit',
}

// Input fields
export const USER_FIELDS_TO_PERSIST = {
  AVATAR_URL: 'photoURL',
  DISPLAY_NAME: 'displayName',
  EMAIL: 'email',
  FACEBOOK_URL: 'facebookURL',
  LINKEDIN_URL: 'linkedinURL',
  TWITTER_URL: 'twitterURL',
  PROVIDER_DATA: 'providerData',
  //don't want to save the access token to the database
}

