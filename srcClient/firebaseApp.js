import firebase from 'firebase'

// initialize firebase
var config = {
  apiKey: "AIzaSyCKHjHMqp1lt99w9qjm-4zW3CZvajS7wEo",
  authDomain: "growth-tools-70f94.firebaseapp.com",
  databaseURL: "https://growth-tools-70f94.firebaseio.com",
  projectId: "growth-tools-70f94",
  storageBucket: "growth-tools-70f94.appspot.com",
  messagingSenderId: "89645594679"
};

const firebaseApp = firebase.initializeApp(config)
//import serviceAccount from './serviceAccountKey.json'

/*{
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://growth-tools-70f94.firebaseio.com"
});*/


export default firebaseApp 
