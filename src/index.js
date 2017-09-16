import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux stuff
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux';

import store from './reducers'

const root = document.getElementById('app')
console.log("at least it's getting loaded");

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, root
);

registerServiceWorker();


//currently not preloading anything, but if I was, put the watcher here to let the main app know when to render
export const preloadFinished = store.subscribe((newState) => {
  //probably just want to cal an event, to signal preloading is over?
  if (false) {
    //ReactDOM.render(renderApp(), root)
  }
})
