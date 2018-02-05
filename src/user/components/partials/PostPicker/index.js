import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon, Card } from 'shared/components/elements'
import { PostCard, ProviderCard } from 'user/components/partials'
import { SET_CURRENT_POST_TEMPLATE, SET_CURRENT_POST, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
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
    this.toggleOpen = this.toggleOpen.bind(this)
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

  toggleOpen (provider, value, e) {
    this.setState({[provider]: value})
  }

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

  toggleAdding (provider, e) {
    e && e.stopPropagation && e.stopPropagation()
    this.props.toggleAdding(provider)
  }

  setCurrentPost(post) {
    //turn off adding a post when click on a card
    this.props.toggleAdding(false, false)
    this.props.toggleHidePosts(true)
    this.props.setCurrentPost(post, this.props.items)

    //make sure utms are enabled if post has those utms
    let utmKeys = UTM_TYPES.map((t) => t.value)
    let utmFields = {}
    for (let i = 0; i < utmKeys.length; i++) {
      let key = utmKeys[i]
      utmFields[key] = post[key] ? true : false
    }

    formActions.setOptions(this.props.form, this.props.items, {[post.id]: {utms: utmFields}})
  }

  render() {
    const sortedPosts = this.sortPostsByProvider(this.props.postsParams || {})
    const providers = Object.keys(this.props.providerAccounts)

    return (
      <div className={`${classes.container} ${this.props.hidden ? classes.hidden : ""}`}>

        {false && <h2>Current Post{this.props.items === "postTemplates" ? " Template" : ""}s:</h2>}

        <Flexbox className={classes.table} direction="column" align="center">
          {false && <Flexbox className={` ${classes.tableHeader}`} direction="row">
            <div className={`${classes.columnOne}`}></div>
            <div className={`${classes.columnTwo}`}></div>
            <div className={`${classes.columnThree}`}></div>
            <div className={`${classes.columnFour}`}></div>
            <div className={`${classes.columnFive}`}></div>
          </Flexbox>}

          {providers.map((provider, index) => {
            let providerPosts = sortedPosts[provider] || []
            let alternatingClass = (index % 2) == 1 ? "oddRow" : "evenRow"

            return (
              <Flexbox
                key={provider}
                className={`${classes.providerContainer} ${classes[alternatingClass]}`}
                direction="column"
              >
                <Flexbox
                  className={`${classes.row} ${classes.topRow}`}
                  direction="row"
                  align="center"
                  justify="space-between"
                  onClick={this.toggleOpen.bind(this, provider, this.state[provider] === "open" ? "closed" : "open")}
                >
                  <div className={` ${classes.header}`}>
                    <Icon name={this.state[provider] === "open" ? "angle-down" : "angle-right"} />&nbsp;
                    <Icon name={provider.toLowerCase()} />&nbsp;
                    {Helpers.providerFriendlyName(provider)}&nbsp;
                    ({providerPosts.length})
                  </div>

                  <Button
                    onClick={this.toggleAdding.bind(this, provider)}
                    className={classes.twoColumns}
                  >
                    <Icon name={provider.toLowerCase()} className={classes.icon}/>&nbsp;&nbsp;Add post
                  </Button>
                </Flexbox>

                {this.state[provider] === "open" && providerPosts.length > 0 &&
                  <Flexbox className={`${classes.postList} ${classes.row}`} direction="row" align="flex-start" flexWrap="wrap">
                    {providerPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        className={`${classes.postCard} ${post.publishedAt ? classes.publishedPost : ""}`}
                        subtitle={post.publishedAt ? "Already Published" : ""}
                        post={post}
                        showText={this.props.items === "posts"}
                        maxWidth="200px"
                        onClick={!post.publishedAt && this.setCurrentPost.bind(this, post)}
                        selected={this.props.currentPost && this.props.currentPost.id === post.id}
                        small={true}
                        wrapperClass={classes.cardWrapper}
                      />
                    ))}
                  </Flexbox>
                }
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
    user: state.user,
    providerAccounts: state.providerAccounts,
    currentPost: state.currentPost,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    setCurrentPost: (payload, items, options) => {
      let type = items === "posts" ? SET_CURRENT_POST : SET_CURRENT_POST_TEMPLATE
      dispatch({type, payload, options})

    },
  }
}

const ConnectedPostPicker = connect(mapStateToProps, mapDispatchToProps)(PostPicker)
export default ConnectedPostPicker

