// Social contants
// using module.exports so can either import or require (front end server only uses require)
//keep this in sync with backend constants

const env = process.env
const domain = process.env.CLIENT_URL || 'http://www.local.dev:5000'
const callbackPath = process.env.PROVIDER_CALLBACK_PATH || '/provider_redirect'
const callbackUrl = domain + callbackPath

module.exports = {
  PLAN_STATUSES: [
    "DRAFT",
    "ACTIVE",
    "ARCHIVED"
  ],
  PROVIDER_STATUSES: [
    "ACTIVE",
    "ARCHIVED"
  ],
  POST_STATUSES: [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED"
  ],

  //all possible providers that can be in the provider column
  PROVIDERS: {
    FACEBOOK: {
      name: 'Facebook',
      providerId: 'FACEBOOK',
      channels: {
        PERSONAL_POST: ["publish_actions"],
        //PRIVATE_MESSAGE: [probably friends, ],
        GROUP_POST: ["publish_actions", "user_managed_groups"],
        PAGE_POST: ["manage_pages", "publish_pages", "pages_show_list"], //mostly for businesses
        //"DARK_POST",
        //"BUSINESS_MESSAGE",
      },
      getAccessTokenUrl: `https://graph.facebook.com/v2.10/oauth/access_token?
        client_id=${env.CLIENT_FACEBOOK_ID}
        &redirect_uri=${callbackUrl}/facebook
        &client_secret=${env.CLIENT_FACEBOOK_SECRET}
        &code=
      `,
      options: {
        client_id: process.env.CLIENT_FACEBOOK_ID,
        client_secret: process.env.CLIENT_FACEBOOK_SECRET,
        redirect_uri: `${callbackUrl}/facebook`,
        //Promise: require('bluebird')//maybe want to do this?
        //scope: 'email, '
      }
      //appsecret is automatically set (?)
    },
    //GITHUB: 'github',
    /*GOOGLE: {
      name: 'Google',
      providerId: 'GOOGLE',
      channels: []
    },*/
    LINKEDIN: {
      name: 'LinkedIn',
      providerId: 'LINKEDIN',
      channels: {
        PERSONAL_POST: [],
        //PRIVATE_MESSAGE: [probably friends, ],
        GROUP_POST: [],
        PAGE_POST: [], //mostly for businesses
      }
    },
    TWITTER: {
      name: 'Twitter',
      providerId: 'TWITTER',
      channels: {
        PERSONAL_POST: [],//tweet. distinct from business post?
        PRIVATE_MESSAGE: [],//probably friends, ],
      }
    },
  },
}
      //keep this in sync with the frontend constants

