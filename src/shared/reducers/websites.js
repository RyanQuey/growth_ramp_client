import {
  FETCH_ALL_GA_ACCOUNTS_SUCCESS,
  SIGN_OUT,
} from 'constants/actionTypes'

const websitesReducer = (state = {}, action) => {
  let newState, accounts, account, websites = {}, googleUserAccounts

  const pld = action.payload
  switch (action.type) {

    case FETCH_ALL_GA_ACCOUNTS_SUCCESS:
      // a given GR user might have multiple google accounts
      googleUserAccounts = pld || []

      for (let googleUserAccount of googleUserAccounts) {
        // each google user acct might have access to multiple GA accts
        let analyticsAccounts = googleUserAccount.items || []
        for (let analyticsAccount of analyticsAccounts) {
          // websites this analytics account has
          // TODO might be elsewhere besides webProperties. But we are a content marketing site so probably all websites
          let sites = analyticsAccount.webProperties || []

          //each site will become a key in websites
          for (let site of sites) {
            //map accountIds onto each site for futureu reference
            Object.assign(site, {
              providerAccountId: googleUserAccount.providerAccountId,
              //analyticsAccountId: analyticsAccount.id, not needed
            })
            websites[site.id] = site
          }
        }
      }

      return websites

    case SIGN_OUT:
      return {}

    default:
      return state
  }
}

export default websitesReducer

