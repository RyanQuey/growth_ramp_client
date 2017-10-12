import $ from 'jquery'
import Cookies from "js-cookie"
import {
  CHECK_USER_TOKEN,
  SET_CURRENT_USER
} from 'constants/actionTypes'

export default () => {
  const Cookie = {
    get: function(key){
      try {
        const cookie = Cookies.get(key)
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

  //anything else I want to say to the browser, besides cookies?
  if(Cookie.get('sessionUser')){
    let cu = Cookie.get('sessionUser');
    if (cu.id) {
      //ask the API if the token is legitimate
      store.dispatch({type: CHECK_USER_TOKEN, payload: cu.apiToken})


      store.dispatch({type: SET_CURRENT_USER, payload: cu});
    }
  }

}

