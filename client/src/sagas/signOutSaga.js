import 'babel-polyfill'
import { put, takeLatest } from 'redux-saga/effects'
import firebase from 'firebase'
import { SIGN_OUT_REQUEST } from '../actions/types'
import { signOut } from '../actions'

function* signUserOut() {
  try {
    //actually call the signout
    yield firebase.auth().signOut()
    //handle the successful signout
    yield put(signOut(true))

  } catch (e) {
    console.log('There was an error in the signUserOut:', e.message)
    //yield put(signOut('err'))
  }
}

export default function* signOutSaga() {
  yield takeLatest(SIGN_OUT_REQUEST, signUserOut)
}
