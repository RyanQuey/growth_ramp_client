import { PROVIDERS } from 'constants/providers'

const sanitizeForUtm = (string) => {
  let utm = string.replace(/(\s|&|@|\$|!)+/g, "-")
  return utm
}

//defaultValue will be function set if they first enable a utm
export const UTM_TYPES = [
  {
    label: "Source",
    type: "sourceUtm",
    requiredIfUtmsEnabled: true,
    defaultActive: true,
    defaultValue: (account, channel, campaign = false, channelType) => {
      //needs account and either channel or channelType
      let providerName = account ? account.provider : channel.provider

      //either need channel or the other two
      let ret = `${Helpers.providerFriendlyName(providerName)}-${Helpers.channelTypeFriendlyName(channel, providerName, channelType).replace(" ", "-")}`

      return ret
    },
  },
  {
    label: "Medium",
    type: "mediumUtm",
    requiredIfUtmsEnabled: false,
    defaultActive: true,
    defaultValue: (account, channel, campaign, channelType) => {
      //if neither channel nor account exist, should throw error
      //if not personal post, needs channel
      let providerName = account ? account.provider : channel.provider

      let ret

      if (channelType === "PERSONAL_POST") {
        //just using user name, so Facebook-Ryan-Quey
        //no channel record exists for personal posts
        let providerAccountId = account ? account.id : channel.providerAccountId
        //if no providerAccounts...the app is broken. SHould always have all of those in the store
        let providerAccounts = Helpers.safeDataPath(store.getState(), `providerAccounts.${providerName}`, [])
        //get account if isn't passed in
        account = account || (providerAccounts.find((a) => a.id === providerAccountId))
        let userName = account.userName || account.email || account.providerUserId

        ret = `${sanitizeForUtm(userName)}`

      } else {
        //should be a channel name. But if there isn't...
        ret = channel.name ? sanitizeForUtm(channel.name) : ""

      }

      return ret
    },
  },
  {
    label: "Campaign Name",
    type: "campaignUtm",
    requiredIfUtmsEnabled: false,
    defaultActive: true,
    //if no campaign, should be a plan. In that case, let users use strings which will get converted
    defaultValue: (account, channel, campaign) => (campaign ? "{{campaign.name}}" : "")
  },
  {
    label: "Content",
    type: "contentUtm",
    requiredIfUtmsEnabled: false,
    defaultActive: false,
    defaultValue: (account, channel) => ("")
  },
  {
    label: "Term",
    type: "termUtm",
    requiredIfUtmsEnabled: false,
    defaultActive: false,
    defaultValue: (account, channel) => ("")
  },
  /*{
    label: "Custom",
    type: "customUtm",
    requiredIfUtmsEnabled: false,
    defaultActive: false,
    defaultValue: (account, channel) => ("")
  },*/
]

// Using this as a referewnce: https://stackoverflow.com/questions/15275445/length-of-goo-gl-urls
// and counting google links, it appears that twitter always has it at 20 characters, and google is maybe even 21, maybe 13, maybe 19...just stick to 21, maybe even 21, if including https:// for all, to be safe

export const URL_LENGTH = 21
