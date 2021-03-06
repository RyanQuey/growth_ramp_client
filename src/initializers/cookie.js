import $ from 'jquery'
import Cookies from "js-cookie"
import {
  CHECK_USER_TOKEN,
  SET_CURRENT_USER,
  FETCH_CURRENT_USER_REQUEST,
} from 'constants/actionTypes'
import { setupSession } from 'lib/socket'

export default () => {
  const Cookie = {
    get: function(key){
      try {
        const cookie = Cookies.get(key)
        //JSON.parse doesn't work for some reason, jquery adds some action stuff which makes it work
        return $.parseJSON(cookie)

      } catch (e) {

      }
    },
    set: function(key, value){
      return Cookies.set(key, JSON.stringify(value),  { domain: '.' + this.host, path: '/'  })
    },
    remove: function(key){
      Cookies.remove(key, { domain: '.' + this.host })
    }
  }
  window.Cookie = Cookie
  window.Cookies = Cookies

  Cookie.host = location.host.split(".")
  Cookie.host.shift()
  Cookie.host = Cookie.host.join(".")
  Cookie.host = Cookie.host.split(":")[0]

   //Not sure if this works
  if (location.host === "localhost:5000") { //hacky way of working on it while using localhost...
    Cookie.host = "localhost"
  }

  //anything else I want to save to the browser, besides cookies?
  let cu = Cookie.get('sessionUser');
  if (cu && cu.id) {
    //TODO: check it user info is up-to-date with the backend. Also, if they have an expired API token, don't want them working for a while thinking their loggedin, then a make request to the API and find out otherwise
    setupSession(cu)
    store.dispatch({type: FETCH_CURRENT_USER_REQUEST, payload: {id: cu.id, apiToken: cu.apiToken}});
  } else {
    //is no user, create socket without user headers
    setupSession()
  }

}

