import 'babel-polyfill'
import firebase from 'firebase'
import { put, takeLatest, all } from 'redux-saga/effects'
import { linkAccountRequested, tokensUpdateRequested, linkAccountSucceeded  } from '../actions'
import { LINK_ACCOUNT_REQUESTED } from '../actions/types'
import helpers from '../helpers'

function* linkEmail(data) {
  const credential = firebase.auth().EmailAuthProvider.credential(data.email, data.password)
  const user = yield firebase.auth.currentUser.link(credential)
  user.redirect = true
  user.history = data.history
  return user 
}

function* linkProvider(providerName) {
  let provider

  switch (providerName) {
    case 'FACEBOOK':
      provider = new firebase.auth.FacebookAuthProvider()
      break
    case 'GITHUB':
      provider = new firebase.auth.GithubAuthProvider()
      break
    case 'GOOGLE':
      provider = new firebase.auth.GoogleAuthProvider()
      break
    case 'TWITTER':
      provider = new firebase.auth.TwitterAuthProvider()
      break
  }

  const linkResult = yield firebase.auth().currentUser.linkWithPopup(provider)
    .then((result) => {
      //will build off of this object and then send it
      let data = result.user
      data.credential = result.credential

      //  The signed-in user info.
      //  Only using this data for now, so assigning to the result.user
      data.redirect = true
      if (result.history) {
        data.history = result.history
      }

      return data
    }).catch(function(err) {
      helpers.handleError(err)
      alert(`PROVIDER LINK ERROR: ${err.message}`);
    }); 

  return linkResult
}

function* linkAccount(action) {
  try {
    const signInType = action.payload.signInType
    const credentials = action.payload.credentials
    const provider = action.payload.provider

    let linkResult
    switch (signInType) {
      case 'EMAIL':
        linkResult = yield linkEmail(credentials)
        break
      case 'PROVIDER':
        linkResult = yield linkProvider(provider)
        break
    }

    if (linkResult) {
      console.log(linkResult);
      let userProviders = []
      linkResult.providerData && linkResult.providerData.forEach((provider) => {
        userProviders.push(provider.providerId)
      })
      yield all([
        put(tokensUpdateRequested({
          providerIds: userProviders, 
          credential: linkResult.credential
        })),
        put(linkAccountSucceeded({
          providerData: linkResult.providerData
        }))
      ])

      
    } else {
      //no user found
      //TODO: make a separate action for the error
    }
  } catch (err) {
    console.log('Error in Link account Saga', err)
  }
}

export default function* linkAccountSaga() {
  yield takeLatest(LINK_ACCOUNT_REQUESTED, linkAccount)
}
