//socket for interacting with sails
//will want a continual flow of saving when creating a plan or message draft
//otherwise probably just use HTTP?
let socket
if(!socket){
  io.sails.url = process.env.API_URL,
  socket = io.sails.connect()
}

//can also do Sails.socket.on('[event]'...
const Sails = {socket}

["get", "put", "post", "delete"].forEach((action) => {
  Sails[action] = (url, options) => {
    new Promise((resolve, reject)=>{
      //takes a call back for the second parameter
      socket[action](url, (body, status)=>{
        if(status.statusCode > 399 && status.statusCode < 406){
          reject(status)
        }else{
          resolve(body)
        }
      })
    })
  }
})

window.Sails = Sails;
export default Sails;
