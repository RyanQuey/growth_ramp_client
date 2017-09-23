import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import Cookies from 'js-cookie'
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux stuff
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { Provider } from 'react-redux';

import initializers from './initializers'
initializers()

const root = document.getElementById('app')

window.React = React;
window.axios = axios;
window.Cookies = Cookies

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
