// Social contants
//keep this in sync with backend constants
export const PROVIDERS = {
  FACEBOOK: {
    name: 'Facebook',
    providerId: 'facebook.com',
    channels: [
      "PERSONAL_POST",
      //"PRIVATE_MESSAGE",
      "GROUP_POST",
      "PAGE_POST",//mostly for businesses
      //"DARK_POST",
      //"BUSINESS_MESSAGE",
    ],
  },
  //GITHUB: 'github',
  /*GOOGLE: {
    name: 'Google',
    providerId: 'google.com',
    channels: []
  },*/
  LINKEDIN: {
    name: 'LinkedIn',
    providerId: 'linkedin.com',
    channels: [
      "PERSONAL_POST",
      //"PRIVATE_MESSAGE",
      "GROUP_POST",
      "PAGE_POST", //mostly for businesses
    ]
  },
  TWITTER: {
    name: 'Twitter',
    providerId: 'twitter.com',
    channels: [
      "PERSONAL_POST", //tweet. distinct from business post?
      "PRIVATE_MESSAGE",
    ]
  },
  //REDDIT: 'reddit',
}

//maps provider IDs provided by firebase
export const PROVIDER_IDS_MAP = {
  'facebook.com': 'FACEBOOK',
  //GITHUB: 'GITHUB',
  'google.com': 'GOOGLE',
  'linkedin.com': 'LINKEDIN',
  'twitter.com': 'TWITTER',
  //REDDIT: 'REDDIT',
}

// to determine which fields to extract from firebase auth responses
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

