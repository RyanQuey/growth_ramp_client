import React, { Component } from 'react';
import logo from './logo.svg';
import ShareButton from './components/shareButton';
import Login from './components/login';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <ShareButton />
        <Login />
      </div>
    );
  }
}

export default App;
