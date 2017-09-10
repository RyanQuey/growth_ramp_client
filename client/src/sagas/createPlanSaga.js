import 'babel-polyfill'
import { put, select, takeLatest, all } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { PLAN_CREATE_SUCCESS, PLAN_CREATE_REQUEST, CHOOSE_PLAN } from '../actions'
import _ from 'lodash'
import helpers from '../helpers'
import moment from 'moment'
const database = fbApp.database();

function* create(action) {
  try {
    const pld = action.payload

    const planId = helpers.uniqueId()
    const newPlan = {
      posts: [],
      channelConfigurations: [],
      createdAt: moment().format(),
      name: pld.name || "",
      utmOptions: {},
      userId: pld.userId,
      id: planId,  
    }
    database.ref(`plans/${planId}`).set(newPlan);

    let relationEntry = {}
    relationEntry[planId] = true;
    yield database.ref(`users/${pld.userId}/plans`).set(relationEntry)

    pld.plan = {[planId]: newPlan} 
    yield all([
      put({ type: PLAN_CREATE_SUCCESS, payload: {[planId]: newPlan }}),
      put({ type: CHOOSE_PLAN, payload: newPlan }),
    ])

  } catch (err) {
    console.log(`Error in Create plan Saga ${err}`)
  }
}

export default function* createNewPlan() {
  yield takeLatest(PLAN_CREATE_REQUEST, create)
}

