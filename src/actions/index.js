import { 
  FACEBOOK_POST_PUBLISH_REQUESTED,
  INPUT_UPDATE_SUCCEEDED,
  IS_PRELOADING_STORE,
  LOG_IN_WITH_PROVIDER,
  POST_CREATE_REQUESTED,
  POST_CREATE_SUCCEEDED,
  POSTS_FETCH_REQUESTED,
  POSTS_FETCH_SUCCEEDED,
  POST_REMOVE_REQUESTED,
  POST_REMOVE_SUCCEEDED,
  SET_CURRENT_USER,
  SET_IMAGE,
  SET_INPUT_VAL,
  SIGN_IN_REQUESTED,
  SIGN_OUT,
  SIGN_OUT_REQUESTED,
  TOKENS_UPDATE_FAILED,
  TOKENS_UPDATE_REQUESTED,
  TOKENS_UPDATE_SUCCEEDED,
  USER_FETCH_FAILED,
  USER_FETCH_REQUESTED,
  USER_FETCH_SUCCEEDED,
} from './types'

export const facebookPostPublishRequested = (payload) => (
  { type: FACEBOOK_POST_PUBLISH_REQUESTED, payload }
)
export const isPreloadingStore = preloadingData => (
  { 
    type: IS_PRELOADING_STORE, 
    payload: { preloadingData }
  }
)
export const postCreateRequested = (payload) => (
  { type: POST_CREATE_REQUESTED, payload }
)
export const postCreateSucceeded = (payload) => (
  { type: POST_CREATE_SUCCEEDED, payload }
)
export const postsFetchRequested = payload => (
  { type: POSTS_FETCH_REQUESTED, payload }
)
export const postsFetchSucceeded = payload => (
  { type: POSTS_FETCH_SUCCEEDED, payload }
)
export const postRemoveRequested = (payload) => (
  { type: POST_REMOVE_REQUESTED, payload }
)
export const postRemoveSucceeded = (payload) => (
  { type: POST_REMOVE_SUCCEEDED, payload }
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
//not currently using
export const tokensUpdateFailed = payload => (
  { type: TOKENS_UPDATE_FAILED, payload }
)
//set the token for use with the provider API, or let the user know that they need to sign in again
export const tokensUpdateRequested = payload => (
  { type: TOKENS_UPDATE_REQUESTED, payload }
)
export const tokensUpdateSucceeded = payload => (
  { type: TOKENS_UPDATE_SUCCEEDED, payload }
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


