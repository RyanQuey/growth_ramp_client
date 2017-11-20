import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import babel from 'babel-polyfill'
import {
  BrowserRouter,
} from 'react-router-dom'

import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux stuff
import { Provider } from 'react-redux';
import store from 'shared/reducers'
import 'prototypeHelpers'
import Helpers from 'helpers'
import 'theme/index.scss'

import _ from 'lodash'
import moment from 'moment'

window.React = React;
window.axios = axios;
window._ = _
window.moment = moment
window.Helpers = Helpers


import initializers from './initializers'
initializers()

const root = document.getElementById('app')

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>, root
);

registerServiceWorker();
