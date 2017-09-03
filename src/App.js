import React, { Component } from 'react';
// here, adds the additional string functions
import helpers from './helpers'
import logo from './logo.svg';
import ShareButton from './components/shareButton';
import Login from './components/login';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <Login />
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome</h2>
        </div>
        <ShareButton />
      </div>
    );
  }
}

export default App;
