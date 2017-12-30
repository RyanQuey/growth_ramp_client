import {
  FETCH_PROVIDER_REQUEST,
} from 'constants/actionTypes'

export default {
  parseCampaignResults: (data) => {
    const posts = data.posts
    let ret = {
      //campaign and posts will be set to the store no matter what, as is
      campaign: data,
      posts: [...posts],
      //this is for all
      failedPosts: [],
      //note: these also failed to publish, but failed even at the short-link phase
      //putting these posts in both
      duplicates: [],
      failedToPublish: [], //if
      publishedButNotUpdated: [],
      requireReauthorization: [], //the posts
      accountsToReauthorize: [], //the accounts
      //most dangerous; published, but our db isn't reflecting it
      needsToChangeFBSettings: [], //the posts
      fbAccountsToChangeSettings: [], //the accounts

      alertMessage: "",  //for the alert
      alertTitle: "Successfully Published Posts!",      //
      alertLevel: "SUCCESS",
      alertTimer: true, //default to this, unless there are errors
    }


    for (let post of posts) {
      //if has error property, something went wrong somewhere along the way.
      if (post.error) {
        ret.failedPosts.push(post)
        ret.alertTimer = false
        ret.alertLevel = "DANGER"

        //parse the code that GR api set
        switch (post.error.code) {
          case "no-post":
            ret.failedToShortenUrl.push(post)
            ret.failedToPublish.push(post)
            break
          //don't need to know what shortenedURl already or not; but we're ready for if we do
          case "failed-to-shorten-link":
            ret.failedToShortenUrl.push(post)
            ret.failedToPublish.push(post)
            break

          case "failed-to-publish-unknown":
            ret.failedToPublish.push(post)
            break

          case "require-reauthorization":
            ret.failedToPublish.push(post)
            ret.requireReauthorization.push(post) //the posts
            break

          case "change-facebook-app-visibility-settings":
            ret.failedToPublish.push(post)
            ret.needsToChangeFBSettings.push(post) //the posts
            break
          //this is scope issue; but still prompting same thing for now
          case "insufficient-permissions":
            ret.failedToPublish.push(post)
            ret.requireReauthorization.push(post) //the posts
            break

          case "unknown-error-while-publishing":
            ret.failedToPublish.push(post)
            break

          case "rate-limit-reached":
            ret.failedToPublish.push(post)
            break

          case "duplicate-post":
            ret.failedToPublish.push(post)
            ret.duplicates.push(post)
            break

          case "published-but-failed-to-save":
            ret.publishedButNotUpdated.push(post)
            break
          default:
            break
        }
      }
    }

    //extract accounts requiring reauthorization
    if (ret.requireReauthorization.length) {
      ret.accountsToReauthorize = Helpers.extractAccountsFromPosts(ret.requireReauthorization)
    }

    //extract accounts requiring changed settings
    if (ret.needsToChangeFBSettings.length) {
      ret.fbAccountsToChangeSettings = Helpers.extractAccountsFromPosts(ret.requireReauthorization)
    }

    if (ret.failedPosts.length ) {

      //refresh provider accounts, api probably changed them TODO find better way
      store.dispatch({type: FETCH_PROVIDER_REQUEST})

      if (ret.failedPosts.length === posts.length ) {
        ret.alertTitle = "All posts failed to publish:"
      } else {
        ret.alertTitle = "Some posts failed to publish:"
      }

      let messages = []
      if (ret.accountsToReauthorize.length) {
        console.log("To reauthorize: ", ret.accountsToReauthorize);
        if (ret.accountsToReauthorize.some((account) => !account || typeof account !== "object")) {
          //something wrong happened, and GR messed up getting acct
          console.error("failed to retrieve failed accounts:", ret.accountsToReauthorize);
          messages.push(`One or more of your accounts need reauthorization`)

        } else {
          let accountNames = ret.accountsToReauthorize.map((account) => `${Helpers.providerFriendlyName(account.provider)} (${account.userName || account.email})`)

          messages.push(`Please login to ${accountNames.join("; ")}`)
        }
      }

      if (ret.fbAccountsToChangeSettings.length) {
        let fbAccountNames = ret.fbAccountsToChangeSettings.map((account) => `${Helpers.providerFriendlyName(account.provider)} (${account.userName || account.email})`)
        messages.push(`The following accounts require you to go to your app settings in Facebook (Settings > Apps > Growth Ramp) and change "App visibility and post audience" to friends or public:  ${fbAccountNames.join("; ")}`)

      }

      if (ret.duplicates.length) {
        messages.push(`Get rid of duplicate posts`)
      }


      ret.alertMessage = messages.length ? messages.join(". ") : "Unknown error. Please refresh the page"
      ret.alertMessage += ". Then try publishing again."
    }

console.log("Full campaign results:", ret);
    return ret
  },
}
