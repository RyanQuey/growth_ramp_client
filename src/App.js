import { Component } from 'react';
import logo from 'images/logo.png';
import User from 'user/components'
console.log(User);
import { connect } from 'react-redux'
import 'App.css';
import {
  withRouter,
} from 'react-router-dom'

class App extends Component {

  componentDidMount() {
    axios.get('/api/test')
    .then(res => console.log("got it: ", res))

    //extract the query string
    const query = this.props.location.search
    //TODO

    this.props.history.push(this.props.location.pathname)
  }

  render() {
    return (
      <div className="App">
        {this.props.preloadingStore ? ( //currently , not implemented...I might not ever
          <div>
            <img src={logo} className="App-logo" alt="logo" />
            <div>loading...</div>
          </div>
        ) : (
          <User />
        )}
      </div>
    );
  }
}

export default withRouter(App)
