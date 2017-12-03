import { put, select, take, takeLatest, call, all } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import {
  SIGN_IN_REQUEST,
  CREATE_POST_TEMPLATE_SUCCESS,
  CREATE_POST_TEMPLATE_REQUEST,
  DESTROY_POST_TEMPLATE_REQUEST,
  DESTROY_POST_TEMPLATE_SUCCESS,
  FETCH_POST_TEMPLATE_REQUEST,
  FETCH_POST_TEMPLATE_SUCCESS,
  PUBLISH_POST_TEMPLATE_REQUEST,
  PUBLISH_POST_TEMPLATE_SUCCESS,
  SET_CURRENT_POST_TEMPLATE,
  UPDATE_POST_TEMPLATE_REQUEST,
  UPDATE_POST_TEMPLATE_SUCCESS,
} from 'constants/actionTypes'
import {errorActions, formActions} from 'shared/actions'

//if want to send one postTemplate apart from campaign
//don't allow this if campaign isn't published yet
function* publishPostTemplate(action) {
  try {
    const pld = action.payload

    yield axios.post(`postTemplates/${pld.campaign.id}/publish`, pld)
    yield put({type: PUBLISH_POST_TEMPLATE_SUCCESS, payload: {providers: pld.providers}})

  } catch (err) {
    console.log(`Error in Create postTemplate Saga ${err}`)
  }
}

function* createPostTemplate(action) {
  try {
    const postTemplate = action.payload

    const res = yield axios.post("/api/postTemplates", postTemplate) //eventually switch to socket
    const newRecord = res.data
    const postTemplateId = newRecord.id

    yield all([
      put({ type: CREATE_POST_TEMPLATE_SUCCESS, payload: newRecord}),
      //TODO especially when there are more postTemplates, will want to just merge this one postTemplate to the postTemplates list, rather than fetching all..
    ])
    if (action.cb) {
      action.cb(newRecord)
    }

  } catch (err) {
    console.log(`Error in Create postTemplate Saga ${err}`)
    errorActions.handleErrors({
      templateName: "PostTemplate",
      templatePart: "create",
      title: "Error creating postTemplate",
      errorObject: err,
    })
  }
}

// need to make sure that the current user and the userId are identical for security reasons
// may try using state.user.uid instead, just pulling from the store directly
//Only want to retrieve this user's postTemplates once...for now
//TODO: set up a listener, so that all data the matter which browser etc. will be lively updated (?), Even if multiple people are working on it
function* fetchPostTemplates(action) {
  try {
    const pld = action.payload || {}
    const userId = pld.userId || store.getState().user.id//making it so no reason to actually attach a payload...

    //TODO: eventually they filter out postTemplates that have already been sent
    //also want to just retrieve a specific postTemplate sometimes...ie, be able to pass in criteria
    const res = yield axios.get(`/api/users/${userId}/postTemplates`) //eventually switch to socket

    //converting into object
    const postTemplates = res.data.reduce((acc, postTemplate) => {
      acc[postTemplate.id] = postTemplate
      return acc
    }, {})

    yield all([
      put({type: FETCH_POST_TEMPLATE_SUCCESS, payload: postTemplates})
    ])

  } catch (err) {
    console.log('postTemplates fetch failed', err)
    // yield put(userFetchFailed(err.message))
  }
}

//NOTE: make sure to always attach the userId to the payload, for all updates. Saves a roundtrip for the api  :)
function* updatePostTemplate(action, cb) {
  try {
    const postTemplateData = action.payload

    const res = yield axios.put(`/api/postTemplates/${postTemplateData.id}`, postTemplateData) //eventually switch to socket

    yield all([
      put({ type: UPDATE_POST_TEMPLATE_SUCCESS, payload: res.data}),
    ])

    if (action.cb) {
      action.cb(res.data)
    }

  } catch (err) {
    console.log(err.response);
    console.log(`Error in update postTemplate Saga ${err}`)
  }
}

function* destroyPostTemplate(action) {
  try {
    const pld = action.payload

    //TODO: eventually they filter out postTemplates that have already been sent
    const res = yield axios.delete(`/api/postTemplates/${pld.id}`) //eventually switch to socket
    yield all([
      put({type: DESTROY_POST_TEMPLATE_SUCCESS, payload: res}),
    ])

    if (action.cb) {
      action.cb(pld) //passing in destroyed record
    }

  } catch (err) {
    console.log('postTemplates destroy failed', err)
  }
}

//Gets all the populated data required for working on a single postTemplate
function* fetchCurrentPostTemplate(action) {
  try {
    const postTemplateId = action.payload

    const res = yield axios.get(`/api/postTemplates/${postTemplateId}`) //eventually switch to socket

    yield all([
      put({type: SET_CURRENT_POST_TEMPLATE, payload: res.data})
    ])

  } catch (err) {
    console.log('postTemplates fetch failed', err.response)
    // yield put(userFetchFailed(err.message))
  }
}


export default function* postTemplateSaga() {
  yield takeLatest(FETCH_POST_TEMPLATE_REQUEST, fetchPostTemplates)
  yield takeLatest(CREATE_POST_TEMPLATE_REQUEST, createPostTemplate)
  yield takeLatest(UPDATE_POST_TEMPLATE_REQUEST, updatePostTemplate)
  yield takeLatest(DESTROY_POST_TEMPLATE_REQUEST, destroyPostTemplate)
  yield takeLatest(PUBLISH_POST_TEMPLATE_REQUEST, publishPostTemplate)
  //when setting as the current postTemplate, will want to populate several of the associations
  //yield takeLatest(SET_POST_TEMPLATE, populatePostTemplate)
}


