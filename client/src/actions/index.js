import { 
  INPUT_UPDATE_SUCCESS,
  IS_PRELOADING_STORE,
  LINK_ACCOUNT_REQUEST,
  LINK_ACCOUNT_SUCCESS,
  LOG_IN_WITH_PROVIDER,
  POST_CREATE_REQUEST,
  POST_CREATE_SUCCESS,
  POSTS_FETCH_REQUEST,
  POSTS_FETCH_SUCCESS,
  POST_PUBLISH_REQUEST,
  POST_PUBLISH_SUCCESS,
  POST_REMOVE_REQUEST,
  POST_REMOVE_SUCCESS,
  SET_CURRENT_USER,
  SET_IMAGE,
  SET_INPUT_VAL,
  SIGN_IN_POPUP_CLOSED,
  SIGN_IN_REQUEST,
  SIGN_OUT,
  SIGN_OUT_REQUEST,
  TOKENS_UPDATE_FAILURE,
  TOKENS_UPDATE_REQUEST,
  TOKENS_UPDATE_SUCCESS,
  USER_FETCH_FAILURE,
  USER_FETCH_REQUEST,
  USER_FETCH_SUCCESS,
} from './types'

export const isPreloadingStore = preloadingData => (
  { 
    type: IS_PRELOADING_STORE, 
    payload: { preloadingData }
  }
)
export const linkAccountRequest = (payload) => (
  { type: LINK_ACCOUNT_REQUEST, payload }
)
export const linkAccountSuccess = (payload) => (
  { type: LINK_ACCOUNT_SUCCESS, payload }
)
export const postCreateRequest = (payload) => (
  { type: POST_CREATE_REQUEST, payload }
)
export const postCreateSuccess = (payload) => (
  { type: POST_CREATE_SUCCESS, payload }
)
export const postsFetchRequest = payload => (
  { type: POSTS_FETCH_REQUEST, payload }
)
export const postsFetchSuccess = payload => (
  { type: POSTS_FETCH_SUCCESS, payload }
)
export const postPublishRequest = (payload) => (
  { type: POST_PUBLISH_REQUEST, payload }
)
export const postPublishSuccess = (payload) => (
  { type: POST_PUBLISH_SUCCESS, payload }
)
export const postRemoveRequest = (payload) => (
  { type: POST_REMOVE_REQUEST, payload }
)
export const postRemoveSuccess = (payload) => (
  { type: POST_REMOVE_SUCCESS, payload }
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
export const signInPopupClosed = payload => (
  { type: SIGN_IN_POPUP_CLOSED, payload }
)
export const signInRequest = payload => (
  { type: SIGN_IN_REQUEST, payload }
)
//starts the signout process
export const signOutRequest = payload => (
  { type: SIGN_OUT_REQUEST, payload }
)
//finishes the signout process
export const signOut = payload => (
  { type: SIGN_OUT, payload }
)
//not currently using
export const tokensUpdateFailure = payload => (
  { type: TOKENS_UPDATE_FAILURE, payload }
)
//set the token for use with the provider API, or let the user know that they need to sign in again
export const tokensUpdateRequest = payload => (
  { type: TOKENS_UPDATE_REQUEST, payload }
)
export const tokensUpdateSuccess = payload => (
  { type: TOKENS_UPDATE_SUCCESS, payload }
)
export const userFetchFailure = payload => (
  { type: USER_FETCH_FAILURE, payload }
)
export const userFetchRequest = payload => (
  { type: USER_FETCH_REQUEST, payload }
)
export const userFetchSuccess = payload => (
  { type: USER_FETCH_SUCCESS, payload }
)

