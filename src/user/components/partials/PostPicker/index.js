import { Component } from 'react';
import { connect } from 'react-redux'
import { Flexbox, Button, Icon } from 'shared/components/elements'
import { PostCard } from 'user/components/partials'
import { SET_INPUT_VALUE, SET_CURRENT_MODAL, UPDATE_PLAN_REQUEST  } from 'constants/actionTypes'
import { PROVIDERS } from 'constants/providers'
import {UTM_TYPES} from 'constants/posts'
import classes from './style.scss'

//shows up as buttons in mobile, or sidebar in browser?
//used in channels and send
class PostPicker extends Component {
  constructor() {
    super()

    this.state = {
      currentPost: null, //will be an index
    }

    this.removePost = this.removePost.bind(this)
    this.sortPostsByProvider = this.sortPostsByProvider.bind(this)
  }

  removePost(post, index) {
    if (this.state.currentPost === index) {
      this.setState({currentPost: null})
    }

    const plan = Object.assign({}, this.props.currentPlan)
    const channelTemplates = Helpers.safeDataPath(plan, `channelConfigurations.${this.props.account.provider}.postTemplates`, [])
    channelTemplates.splice(index, 1)

    this.props.updatePlanRequest(plan)
  }

  //takes posts from all channels and accounts and organizes by provider
  sortPostsByProvider(posts) {
    const sorted = {}
    const accounts = this.props.accounts
    for (let i = 0; i < posts.length; i++) {
      let post = posts[i]
      let provider = accounts.find((a) => post.providerAccountId === a.id)[0].provider

      if (sorted[provider]) {
        sorted[provider].push(post)
      } else {
        sorted[provider] = [post]
      }
    }

    return sorted
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const sortedPosts = this.sortPostsByProvider(this.props.posts || [])
    const providers = Object.keys(sortedPosts)

    return (
      <Flexbox>
        <div className={classes.postMenu}>
          <h3>Your posts:</h3>
          {!sortedPosts.length && <div>No posts yet</div>}

          {providers.map((provider, key) => {
            const providerPosts = sortedPosts[provider]
            return (
              <div>
                <h3>{PROVIDERS[provider].name}</h3>
                {providerPosts.map((post) =>
                  <PostCard
                    key={post.id}
                    post={post}
                    postIndex={postIndex}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Flexbox>
    )
  }
}

const mapStateToProps = state => {
  return {
    campaignPosts: Helpers.safeDataPath(state.forms, "Compose.posts", {}),
    user: state.user,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    setCurrentModal: (payload) => dispatch({type: SET_CURRENT_MODAL, payload}),
    updatePlanRequest: (payload) => {dispatch({type: UPDATE_PLAN_REQUEST, payload})},
  }
}

const ConnectedPostPicker = connect(mapStateToProps, mapDispatchToProps)(PostPicker)
export default ConnectedPostPicker

