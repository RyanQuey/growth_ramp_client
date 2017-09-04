import { 
  CREATE_FACEBOOK_POST,
  CREATE_DRAFT_REQUESTED,
  CREATE_DRAFT_SUCCEEDED,
  INPUT_UPDATE_SUCCEEDED,
  IS_PRELOADING_STORE,
  LOG_IN_WITH_PROVIDER,
  DRAFTS_FETCH_REQUESTED,
  DRAFTS_FETCH_SUCCEEDED,
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

export const createFacebookPost = (payload) => (
  { type: CREATE_FACEBOOK_POST, payload }
)
export const createDraftSucceeded = (payload) => (
  { type: CREATE_DRAFT_SUCCEEDED, payload }
)
export const createDraftRequested = (payload) => (
  { type: CREATE_DRAFT_REQUESTED, payload }
)
export const isPreloadingStore = preloadingData => (
  { 
    type: IS_PRELOADING_STORE, 
    payload: { preloadingData }
  }
)
export const draftsFetchRequested = payload => (
  { type: DRAFTS_FETCH_REQUESTED, payload }
)
export const draftsFetchSucceeded = payload => (
  { type: DRAFTS_FETCH_SUCCEEDED, payload }
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


