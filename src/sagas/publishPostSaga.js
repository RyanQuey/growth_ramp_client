import 'babel-polyfill'
import { put, select, takeLatest } from 'redux-saga/effects'
import fbApp from '../firebaseApp.js'
import { POST_PUBLISH_SUCCESS, POST_PUBLISH_REQUEST } from '../actions/types'
import FB from 'fb';
import helpers from '../helpers'
import _ from 'lodash'
const database = fbApp.database();

function* publish(action) {
  try {
    const pld = action.payload

    //Facebook
    if (pld.providers.includes('facebook')) {
      FB.api(`/me/feed`, 'post', pld.post.message, (response) => {
        if (!response || response.error) {
          let newError = helpers.handleError(response.error);
            
          this.setState({
            status: "error",
            error: newError,
          });
          
        } else {
          alert('Facebook post ID: ' + response.id);
        }
      })
    }
    //Twitter
    if (pld.providers.includes('twitter')) {
      //since I'm passing the token, another reason why this should be done in the backend
      const accessToken = yield select(state => helpers.safeDataPath(state, 'tokens.twitterApi', false))

      if (accessToken) {
        accessToken.__call("statuses_update", {
          status: pld.post.content
        }, function(reply){
          console.log("Twitter response: ",reply)
        });
      } else {
        console.log(" Need to get that twitter access token");
      }
    }

    //mark post as published
    yield database.ref(`posts/${pld.post.id}/published`).set(true)

    yield put({ type: POST_PUBLISH_SUCCESS, payload: {providers: pld.providers}})

  } catch (err) {
    console.log(`Error in Create post Saga ${err}`)
  }
}

export default function* publishPost() {
  yield takeLatest(POST_PUBLISH_REQUEST, publish)
}

