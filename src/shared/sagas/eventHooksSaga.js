//this will have all the "outdated" hooks.
//if something is triggered as outdated, look here for what happens
//
//will ONLY call other events

import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  CURRENT_USER_OUTDATED,
  USER_POSTS_OUTDATED,

  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_POST_REQUEST,
}  from 'constants/actionTypes'

function* refreshUserPosts(action) {
  try {
    yield all([
      put({type: FETCH_POST_REQUEST}),
    ])
  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}

export default function* hooksSaga() {
  yield takeLatest(USER_POSTS_OUTDATED, refreshUserPosts)
}
