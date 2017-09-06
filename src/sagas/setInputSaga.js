import 'babel-polyfill'
import { put, select, throttle } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { INPUT_UPDATE_SUCCEEDED, SET_INPUT_VAL } from '../actions/types'
import _ from 'lodash'

function* updateFirebaseInput(action) {
  try {
    const pld = action.payload
    const uid = yield select(state => state.user.uid)
    const ref = fbApp.database().ref(pld.path)
    const value = pld.value

console.log(value, pld.path);
    yield ref.set(value)

    //TODO: probably want to call a different action depending on the part of the stores being updated and what readers are we called
    yield put({ type: INPUT_UPDATE_SUCCEEDED, payload: pld })

  } catch (err) {
    console.log(`Error in Set Input Saga ${err}`)
  }
}

export default function* setInput() {
  //NOTE: might try using yield throttle(300, SET_INPUT_VAL...
  yield throttle(300, SET_INPUT_VAL, updateFirebaseInput)
}
