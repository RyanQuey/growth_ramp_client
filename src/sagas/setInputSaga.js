import 'babel-polyfill'
import { put, select, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { INPUT_UPDATE_SUCCESSFUL, SET_INPUT_VAL } from '../actions/types'
import _ from 'lodash'

function* updateFirebaseInput(action) {
  try {
    const getUid = state => state.user.uid
    const uid = yield select(getUid)
    const path = `users/${uid}`
    const ref = fbApp.database().ref(path)
    const inputData = action.inputData
    const value = inputData.value

    yield _.throttle(ref.update({ [inputData.name]: value }), 300)

    yield put({ type: INPUT_UPDATE_SUCCESSFUL, inputData })

  } catch (err) {
    console.log(`Error in Set Input Saga ${err}`)
  }
}

export default function* setInput() {
  yield takeLatest(SET_INPUT_VAL, updateFirebaseInput)
}
