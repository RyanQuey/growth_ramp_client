//socket for interacting with sails
//will want a continual flow of saving when creating a plan or message draft
//otherwise probably just use HTTP?
import socketClient from 'socket.io-client'
import sailsClient from 'sails.io.js'

export const setupSession = (user) => {
  if (!user) {
    createSocket()
  } else {
    //for any HTTP requests made in the future
  console.log(axios.defaults);
    axios.defaults.headers["x-id"] = `user-${user.id}`
    axios.defaults.headers["x-user-token"] = user.apiToken

    //set up a new socket
    const headers = {
      "x-id": `user-${user.id}`,
      "x-user-token": user.apiToken
    }
    if (window.api && window.api.socket && window.api.socket.isConnected()) {
      window.api.socket.disconnect()
    }

    createSocket(headers)
  }
}

//only run this if it hasn't been ran before
//otherwise, if this file gets imported multiple times on accident (since it shouldn't), could cause trouble
//TODO: move to initializer 's; unless this should be ran multiple times
//unless is the first time being ran, will override the window.api
const createSocket = (headers) => {
  let api
  const io = sailsClient(socketClient)

  io.sails.autoConnect = false
  io.sails.url = process.env.API_URL
  io.sails.environment = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase()
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
}
//handle provider redirects
/*io.socket.on(`LOGIN_WITH_${providerName.toUpperCase()}`, (data) => {
  console.log(data);
})*/
export default createSocket;
