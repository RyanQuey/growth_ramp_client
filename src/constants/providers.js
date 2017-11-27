// Social contants
// using module.exports so can either import or require (front end server only uses require)
//keep this in sync with backend constants


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
      channelTypes: {
        PERSONAL_POST: {
          name: "Personal",
          requiredScopes: ["publish_actions"],
          hasMultiple: false, //if there are a list of channels for this channelType
        },
        //PRIVATE_MESSAGE: [probably friends, ],
        GROUP_POST: {
          name: "Group",
          requiredScopes: ["publish_actions", "user_managed_groups"],
          hasMultiple: true,
        },
        PAGE_POST: {
          name: "Page",
          requiredScopes: ["manage_pages", "publish_pages", "pages_show_list"], //mostly for businesses
          hasMultiple: true,
        },
        //"DARK_POST",
        //"BUSINESS_MESSAGE",
      },
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
      channelTypes: {
        PERSONAL_POST: {
          name: "Personal",
          requiredScopes: ['w_share'],
          hasMultiple: false,
        },
        //PRIVATE_MESSAGE: [probably friends, ],
        //GROUP_POST: ['w_share'], discontinued: https://www.linkedin.com/help/linkedin/answer/81635/groups-api-no-longer-available?lang=en
        PAGE_POST: {
          name: "Page",
          requiredScopes: ['rw_company_admin'], //mostly for businesses https://developer.linkedin.com/docs/company-pages. Watch out, will want to check page settings to see if they have permitted it in their linkedIn accoutn
          hasMultiple: true,
        },
      }
    },
    TWITTER: {
      name: 'Twitter',
      providerId: 'TWITTER',
      channelTypes: {
        PERSONAL_POST: {
          name: "Personal",
          requiredScopes: [],//tweet. distinct from business post?
          hasMultiple: false,
        },
        //PRIVATE_MESSAGE: [],//probably friends, ], TODO want to support soon
      },
    },
  },
}
      //keep this in sync with the frontend constants

