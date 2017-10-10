import 'babel-polyfill'
import firebase from 'firebase'
import { put, takeLatest, all } from 'redux-saga/effects'
import { USER_FETCH_REQUEST, POST_FETCH_REQUEST, TOKEN_UPDATE_REQUEST, SIGN_IN_POPUP_CLOSED, SIGN_IN_REQUEST } from '../actions'
import helpers from '../helpers'

function* createUserWithEmail(data) {
  const password = Math.random().toString(36).slice(-8)

  const createUserResult = yield firebase.auth()
    .createUserWithEmailAndPassword(data.email, password)
    .then((user) => {
      const userData = user
      userData.redirect = true
      userData.history = data.history
      return userData
    })

  return createUserResult
}

function* signInWithEmail(data) {
  const signInResult = yield firebase.auth().signInWithEmailAndPassword(data.email, data.password)

  return signInResult
}

function* signInWithProvider(providerName) {
console.log(providerName);
  let providerPath

  const loginFunction = (() => {
    new Promise((resolve, reject) => {
      let providerData = {}
      switch (providerName.toUpperCase()) {
        case 'FACEBOOK':
          console.log("now logging into Facebook  via the front end server");
          axios.get('/login/facebook')
          .then(() => {resolve()})
          .catch((err) => {console.log(err);})
          /*FB.login((response) => {
            console.log(response);
            const data = response.authResponse
            providerData.accessToken = data.accessToken
            providerData.accessTokenExpires = data.expiresIn
            providerData.userIdForProvider = data.userID

            return resolve(providerData)
          }, {
            scope: 'email, publish_actions, managed_pages, publish_pages',
            return_scopes: true,
            enable_profile_selector: true, //When true, prompt the user to grant permission for one or more Pages
            profile_selector_ids: ''//pages to grant permission for
          })

           //need to call this from the browser, as far as I can tell
           //passport needs to be done through the server though
           */

          break
        case 'GITHUB':
          providerPath = new firebase.auth.GithubAuthProvider()
          break
        case 'GOOGLE':
          providerPath = new firebase.auth.GoogleAuthProvider()
          break
        case 'TWITTER':
console.log("now logging into twitter, via the front end server");
          axios.get('/login/twitter')
          .then(() => {resolve()})
          .catch((err) => {console.log(err);})
          break
      }
    })
  })

  try {
    const providerData = yield loginFunction()
console.log(providerData);
    axios.post('api/users/login_with_provider', providerData)
      //will build off of this object and then send it
      /*let data = result.user
      data.credential = result.credential

      //  The signed-in user info.
      //  Only using this data for now, so assigning to the result.user
      data.redirect = true
      if (result.history) {
        data.history = result.history
      }*/

      return providerData//data
  } catch (err) {
    let errObj = helpers.handleError(err)
  }
}

function* signIn(action) {
  const pld = action.payload
  try {
    const signInType = pld.signInType
    const credentials = pld.credentials
console.log(pld);
    const provider = pld.provider

    let signInResult
    switch (signInType) {
      case 'CREATE_USER':
        signInResult = yield createUserWithEmail(credentials)
        break
      case 'EMAIL':
        signInResult = yield signInWithEmail(credentials)
        break
      case 'NEW_EMAIL':
        signInResult = yield createUserWithEmail(credentials)
        break
      case 'PROVIDER':
        signInResult = yield signInWithProvider(provider)
        break
    }

console.log(signInResult);
    if (signInResult) {
      console.log(signInResult, pld);
      let userProviders = []
      signInResult.providerData && signInResult.providerData.forEach((provider) => {
        userProviders.push(provider.providerId)
      })

      if (pld.wantTokenOnly) {
        yield  put({type: TOKEN_UPDATE_REQUEST, payload: {
          providerIds: userProviders,
          credential: signInResult.credential
        }})

      //otherwise, get/set all user data
      } else {
        yield all([
          put({type: USER_FETCH_REQUEST, payload: signInResult}),
          put({type: POST_FETCH_REQUEST, payload: signInResult}),
          put({type: TOKEN_UPDATE_REQUEST, payload: {
            providerIds: userProviders,
            credential: signInResult.credential
          }}),
        ])
      }
    } else {
      //no user found
      //TODO: make a separate action for the error
      //yield put(userFetchRequest(null))
    }
     return " all done"
  } catch (err) {
    console.log('Error in Sign In Saga', err)

  } finally {
    //this action is necessary to signal that it is finished, to consider that there are never 2 pop-ups open at the same time
    console.log("finished");
    yield put({type: SIGN_IN_POPUP_CLOSED, payload: undefined})
  }
}

export default function* signInSaga() {
  yield takeLatest(SIGN_IN_REQUEST, signIn)
}
