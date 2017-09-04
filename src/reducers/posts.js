import {
  POSTS_FETCH_SUCCEEDED,
} from '../actions/types'

const postsReducer = (state = null, action) => {

  switch (action.type) {

    case POSTS_FETCH_SUCCEEDED:
      console.log('Merge old and new posts data:', action.payload)
      return Object.assign({}, state, action.payload)

    default:
      return state
  }
}

export default postsReducer

