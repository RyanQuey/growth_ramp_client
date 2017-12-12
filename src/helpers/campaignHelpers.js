import {
  FETCH_PROVIDER_REQUEST,
} from 'constants/actionTypes'

export default {
  parseCampaignResults: (data) => {
    const posts = data.posts
    let ret = {
      //campaign and posts will be set to the store no matter what, as is
      campaign: data,
      posts: posts,
      //this is for all
      failedPosts: [],
      //note: these also failed to publish, but failed even at the short-link phase
      //putting these posts in both
      failedToShortenUrl: [],
      failedToPublish: [],
      requireReauthorization: [], //the posts
      accountsToReauthorize: [], //the accounts
      //most dangerous; published, but our db isn't reflecting it
      publishedButNotUpdated: [],

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
            break

          case "published-but-failed-to-save":
            ret.publishedButNotUpdated.push(post)
            break
          default:

        }
      }
    }

    //extract accounts requiring reauthorization
    if (ret.requireReauthorization.length) {

      for (let post of ret.requireReauthorization) {
        let accountId = post.providerAccountId
        if (!ret.accountsToReauthorize.includes(accountId)) {
          ret.accountsToReauthorize.push(accountId)
        }
      }

      //now array of records
      const allProviderAccounts = Helpers.flattenProviderAccounts()
console.log(allProviderAccounts);
      ret.accountsToReauthorize = ret.accountsToReauthorize.map((id) => allProviderAccounts.find((account) => account.id === id))

      //refresh provider accounts, api probably changed them
      store.dispatch({type: FETCH_PROVIDER_REQUEST})
    }

    if (ret.failedPosts.length ) {

      if (ret.failedPosts.length === posts.length ) {
        ret.alertTitle = "All posts failed to publish:"
      } else {
        ret.alertTitle = "Some posts failed to publish:"
      }

      let messages = []
      if (ret.accountsToReauthorize.length) {
console.log(ret.accountsToReauthorize);
        let accountNames = ret.accountsToReauthorize.map((account) => `${Helpers.providerFriendlyName(account.provider)} (${account.userName || account.email})`)

        messages.push(`Please login to ${accountNames.join("; ")}`)
      }

      ret.alertMessage = messages.join("; ")
      ret.alertMessage += ". Then try publishing again."
    }

console.log("Full campaign results:", ret);
    return ret
  },
}
