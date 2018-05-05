import {
  FETCH_ALL_GA_ACCOUNTS_SUCCESS,
  SIGN_OUT_SUCCESS,
} from 'constants/actionTypes'

const availableWebsitesReducer = (state = {}, action) => {
  let newState, accounts, account, websites = {}, googleUserAccounts, api

  const pld = action.payload
  switch (action.type) {

    case FETCH_ALL_GA_ACCOUNTS_SUCCESS:
      // a given GR user might have multiple google accounts
      accounts = pld || []
      api = action.api

      if (api === "GoogleAnalytics") {
        websites.gaSites = {}

        for (let googleUserAccount of accounts) {
          // each google user acct might have access to multiple GA accts
          let analyticsAccounts = googleUserAccount.items || []
          for (let analyticsAccount of analyticsAccounts) {
            // websites this analytics account has
            if (!analyticsAccount.webProperties) {
              // if this ga account doesn't have web properties attached, don't use
              continue
            }

            //each site will become a key in websites
            for (let property of analyticsAccount.webProperties) {
              //map accountIds onto each site for futureu reference
              Object.assign(property, {
                providerAccountId: googleUserAccount.providerAccountId,
                externalGaAccountId: analyticsAccount.id,
                gaWebPropertyId: property.id,
              })
              websites.gaSites[property.id] = property
            }
          }
        }
      } else if (api === "GoogleSearchConsole") {
        websites.gscSites = {}

        for (let googleUserAccount of accounts) {
          // each google user acct might have access to multiple GA accts
          let gscWebsites = googleUserAccount.siteEntry || []

          // websites this gsc account has registered, though might not have actual permission to
          //each site will become a key in websites
          for (let site of gscWebsites) {
            //map accountIds onto each site for futureu reference
            Object.assign(site, {
              providerAccountId: googleUserAccount.providerAccountId,
            })
            websites.gscSites[site.siteUrl] = site
          }
        }

      }

      return Object.assign({}, state, websites)

    case SIGN_OUT_SUCCESS:
      return {}

    default:
      return state
  }
}

export default availableWebsitesReducer

