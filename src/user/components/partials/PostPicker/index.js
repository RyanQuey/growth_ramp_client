import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {UTM_TYPES} from 'constants/posts'
import {formActions} from 'shared/actions'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in Compose only
class PostPicker extends Component {
  constructor() {
    super()

    this.state = {
      currentPost: null, //will be an index
    }

    //this.removePost = this.removePost.bind(this)
    this.sortPostsByProvider = this.sortPostsByProvider.bind(this)
    this.setCurrentPost = this.setCurrentPost.bind(this)
  }

  /*removePost(post, index) {
    if (this.state.currentPost === index) {
      this.setState({currentPost: null})
    }

    const plan = Object.assign({}, this.props.currentPlan)
    const channelTemplates = Helpers.safeDataPath(plan, `channelConfigurations.${this.props.account.provider}.postTemplates`, [])

    this.props.updatePostRequest(plan)
    this.props.setCurrentPost(null)
  }*/

  //takes posts from all channels and accounts and organizes by provider
  sortPostsByProvider(posts) {
    const postsArray = _.values(posts)
    const sorted = {}
    const providers = Object.keys(this.props.providerAccounts)

    for (let i = 0; i < providers.length; i++) {
      let provider = providers[i]
      let accountsIdsForProvider = this.props.providerAccounts[provider].map((a) => a.id)

      sorted[provider] = []

      //iterate backwards so indices work
      for (let i = postsArray.length -1; i > -1; i--) {
        let post = postsArray[i]
        //in case it's populated
        let postAccountId = post.providerAccountId.id || post.providerAccountId
        if (accountsIdsForProvider.includes(postAccountId)) {
          sorted[provider].push(post)
          //so don't have to iterate over again
          postsArray.splice(i, 1)
        }
      }
    }

    return sorted
  }

  setCurrentPost(post) {
    //turn off adding a post when click on a card
    this.props.toggleAdding(false, false)
    this.props.toggleHidePosts(true)
    this.props.setCurrentPost(post)

    //make sure utms are enabled if post has those utms
    let utmKeys = UTM_TYPES.map((t) => t.value)
    let utmFields = {}
    for (let i = 0; i < utmKeys.length; i++) {
      let key = utmKeys[i]
      utmFields[key] = post[key] ? true : false
    }

    formActions.setOptions("EditCampaign", "posts", {[post.id]: {utms: utmFields}})
  }

  render() {
    const sortedPosts = this.sortPostsByProvider(this.props.campaignPostsParams || [])
    const providers = Object.keys(PROVIDERS)

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>
        <h2>Current Posts:</h2>
        {!Object.keys(sortedPosts).length && <div>No posts yet</div>}

        <Flexbox className={classes.table} flexWrap="wrap">
          {providers.map((provider) => {
            let providerPosts = sortedPosts[provider]
            return (
              <Flexbox key={provider} className={classes.providerColumn} direction="column" align="center">
                <h2>{PROVIDERS[provider].name}</h2>

                <Button
                  onClick={this.props.toggleAdding.bind(this, provider)}
                >
                  {<Icon name={provider.toLowerCase()} className={classes.icon}/>}&nbsp;&nbsp;Add post
                </Button>

                <div className={classes.postList}>
                  {providerPosts.map((post) => {

                    let status
                    if (post.toDelete) {
                      status = "toDelete"
                    } else if (typeof post.id === "string") {
                      status = "toCreate"

                    } else if (post.dirty){
                      status = "toUpdate"
                    }

                    return (
                      <PostCard
                        key={post.id}
                        className={`${classes.postCard} ${post.publishedAt ? classes.publishedPost : ""}`}
                        subtitle={post.publishedAt ? "Already Published" : ""}
                        post={post}
                        showText={true}
                        status={status}
                        maxWidth="200px"
                        onClick={!post.publishedAt && this.setCurrentPost.bind(this, post)}
                        selected={this.props.currentPost && this.props.currentPost.id === post.id}
                        small={true}
                        wrapperClass={classes.cardWrapper}
                      />
                    )
                  })}
                </div>
              </Flexbox>
            )

          })}
        </Flexbox>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    //really is campaign posts params
    campaignPostsParams: Helpers.safeDataPath(state.forms, "EditCampaign.posts.params", {}),
    user: state.user,
    providerAccounts: state.providerAccounts,
    currentPost: state.currentPost,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    setCurrentPost: (payload, options) => dispatch({type: SET_CURRENT_POST, payload, options}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedPostPicker = connect(mapStateToProps, mapDispatchToProps)(PostPicker)
export default ConnectedPostPicker

