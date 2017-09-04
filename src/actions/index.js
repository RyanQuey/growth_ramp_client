import { 
  CREATE_FACEBOOK_POST,
  CREATE_POST_DRAFT,
  INPUT_UPDATE_SUCCESSFUL,
  IS_PRELOADING_STORE,
  LOG_IN_WITH_PROVIDER,
  POSTS_FETCH_REQUESTED,
  POSTS_FETCH_SUCCEEDED,
  SET_CURRENT_USER,
  SET_IMAGE,
  SET_INPUT_VAL,
  SIGN_IN_REQUESTED,
  SIGN_OUT,
  SIGN_OUT_REQUESTED,
  USER_FETCH_FAILED,
  USER_FETCH_REQUESTED,
  USER_FETCH_SUCCEEDED,
} from './types'

export const createFacebookPost = (payload) => (
  { type: CREATE_FACEBOOK_POST, payload }
)
export const createPostDraft = (payload) => (
  { type: CREATE_POST_DRAFT, payload }
)
export const isPreloadingStore = preloadingData => (
  { 
    type: IS_PRELOADING_STORE, 
    payload: { preloadingData }
  }
)
//not been used yet
export const postsFetchRequested = payload => (
  { type: POSTS_FETCH_REQUESTED, payload }
)
export const postsFetchSucceeded = payload => (
  { type: POSTS_FETCH_SUCCEEDED, payload }
)
export const setCurrentUser = (payload) => (
  { type: SET_CURRENT_USER, payload }
)
export const setImage = payload => (
  { type: SET_IMAGE, payload }
)
export const setInputVal = payload => (
  { type: SET_INPUT_VAL, payload }
)
export const signInRequested = payload => (
  { type: SIGN_IN_REQUESTED, payload }
)
//starts the signout process
export const signOutRequested = payload => (
  { type: SIGN_OUT_REQUESTED, payload }
)
//finishes the signout process
export const signOut = payload => (
  { type: SIGN_OUT, payload }
)
export const userFetchFailed = payload => (
  { type: USER_FETCH_FAILED, payload }
)
export const userFetchRequested = payload => (
  { type: USER_FETCH_REQUESTED, payload }
)
export const userFetchSucceeded = payload => (
  { type: USER_FETCH_SUCCEEDED, payload }
)


