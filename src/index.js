import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import admin from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json'

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://growth-tools-70f94.firebaseio.com"
});


ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
