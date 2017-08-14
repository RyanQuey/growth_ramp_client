import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux stuff
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import store from './reducers'
import fetchUserSaga from './sagas'

/* Seems to already be ran in the reducer???
 *
 * const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)

sagaMiddleware.run(fetchUserSaga)
*/
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
