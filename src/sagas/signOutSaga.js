import 'babel-polyfill'
import { put, takeLatest } from 'redux-saga/effects'
import firebase from 'firebase'
import { SIGN_OUT_REQUESTED } from '../actions/types'
import { signOut } from '../actions'

function* signUserOut() {
  try {
    console.log("before signing up");
    //actually call the signout
    yield firebase.auth().signOut()
    console.log(" Saying out");
    //handle the successful signout
    yield put(signOut(true))

  } catch (e) {
    console.log('There was an error in the signUserOut:', e.message)
    //yield put(signOut('err'))
  }
}

export default function* signOutSaga() {
  yield takeLatest(SIGN_OUT_REQUESTED, signUserOut)
}
