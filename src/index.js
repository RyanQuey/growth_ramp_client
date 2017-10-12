import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios'
import babel from 'babel-polyfill'
import {
  BrowserRouter,
} from 'react-router-dom'

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
// redux stuff
import { Provider } from 'react-redux';

import _ from 'lodash'
import moment from 'moment'
import 'prototypeHelpers'
import Helpers from 'helpers'
import store from 'shared/reducers'
import 'theme/index.scss'

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
