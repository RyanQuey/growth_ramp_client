//socket for interacting with sails
//will want a continual flow of saving when creating a plan or message draft
//otherwise probably just use HTTP?
import socketClient from 'socket.io-client'
import sailsClient from 'sails.io.js'

export const setupSession = (user) => {
  //check if already connected, or connecting
  //if already connecting, check if the headers are different, and if so, either aboart the previous connection and start a new one, or just wait for the previous connection to finish connecting, then disconnect it, then start a new one.
  //if already connected,  check if the headers are different, and if so, either disconnect the previous connection and start a new one
  //TODO: figure out what to do if a request comes through, and socket isn't connected
  //actually, the best might be to just never disconnect and reconnect the socket
  //maybe just manually send the headers every time, potentially based on the cookie
  //or maybe the cookie is already sent every time?
  //that way there is no socket downtime
  //if the cookies are removed, want to disconnect the access anyway
  //
  //(what I have below is not going to work)
  /*if (window.api && window.api.socket) {
    let previousSocket = window.api.socket
    if (previousSocket.headers) {}
    if (previousSocket.isConnecting) {}
    window.api.socket.isConnected()
    console.log("now disconnecting socket");
    window.api.socket.disconnect()
  }
console.log(window.api);*/

  if (!user) {
    //createSocket()
    axios.defaults.headers["x-id"] = ``
    axios.defaults.headers["x-user-token"] = ""
  } else {
    //for any HTTP requests made in the future
    axios.defaults.headers["x-id"] = `user-${user.id}`
    axios.defaults.headers["x-user-token"] = user.apiToken

    //set up a new socket
    const headers = {
      "x-id": `user-${user.id}`,
      "x-user-token": user.apiToken
    }

    //createSocket(headers)
  }
  /*axios.interceptors.response.use((response) => {
    console.log("getting res"); return response
  }, (error) => {
    console.log("getting error",); return Promise.reject(error)
  })*/
console.log("setting user", user);
  Cookie.set('sessionUser', user)
}

//only run this if it hasn't been ran before
//otherwise, if this file gets imported multiple times on accident (since it shouldn't), could cause trouble
//TODO: move to initializer 's; unless this should be ran multiple times
//unless is the first time being ran, will override the window.api
const createSocket = (headers) => {
  //disabling for now
  /*
  let api
  const io = sailsClient(socketClient)

  io.sails.autoConnect = false
  io.sails.url = process.env.API_URL || "https://growth-ramp-api.herokuapp.com/" **NOTE*** in browser, won't have access to process.env in production
  io.sails.timeout = 10000 //make shorter
  io.sails.environment = "production" ***NOTE*** in browser, won't have access to process.env in production
  if (headers) {
    io.sails.headers = headers
  }

  const socket = io.sails.connect()

  //so can also do api.socket.on('[event]'...now, since the socket object is a property of the API object
  api = {socket};

  //defines a function for each of the crud
  //now you can do: e.g, api.post("/users", {id: userid, name: "Batman"}).then((result) => {etc})
  //not doing anything with the options yet
  ["get", "put", "post", "delete"].forEach((action) => {
    api[action] = (rawUrl, data, options) => {

      const url = rawUrl.replace('/api', "")
  console.log(url, data);
      new Promise((resolve, reject)=>{
        //socket takes a call back for the second parameter
        //this automatically defines the callback for you
        //NOTE: when using get, or whatever else, if not passing in data, pass in null as the second argument
        socket[action](url, data, (body, status)=>{
          console.log(body, status);
          if(status.statusCode > 399 && status.statusCode < 406){
            reject(status)
          }else{
            resolve(body)
          }
        })
      })
    }
  })

  window.api = api
  */
}
//handle provider redirects
/*io.socket.on(`LOGIN_WITH_${providerName.toUpperCase()}`, (data) => {
  console.log(data);
})*/
export default window.api;
