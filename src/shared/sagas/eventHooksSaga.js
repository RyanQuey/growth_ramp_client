//this will have all the "outdated" hooks.
//if something is triggered as outdated, look here for what happens
//
//will ONLY call other events

import { call, put, takeLatest, all } from 'redux-saga/effects'
import {
  CURRENT_USER_OUTDATED,
  USER_CAMPAIGNS_OUTDATED,
  USER_PLANS_OUTDATED,

  FETCH_USER_REQUEST,
  FETCH_CURRENT_USER_REQUEST,
  FETCH_CAMPAIGN_REQUEST,
  FETCH_PLAN_REQUEST,
}  from 'constants/actionTypes'

function* refreshUserPlans(action) {
  try {
    yield all([
      put({type: FETCH_PLAN_REQUEST}),
    ])
  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}

function* refreshUserCampaigns(action) {
  try {
    yield all([
      put({type: FETCH_CAMPAIGN_REQUEST}),
    ])
  } catch (e) {
    yield Helpers.notifyOfAPIError(e)
  }
}

export default function* hooksSaga() {
  yield takeLatest(USER_CAMPAIGNS_OUTDATED, refreshUserCampaigns)
  yield takeLatest(USER_PLANS_OUTDATED, refreshUserPlans)
}
