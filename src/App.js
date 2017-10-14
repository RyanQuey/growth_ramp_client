import { Component } from 'react';
import logo from 'images/logo.png';
import User from 'user/components'
import { connect } from 'react-redux'
import 'App.css';
import {
  withRouter,
} from 'react-router-dom'
import { HANDLE_QUERY } from 'constants/actionTypes'

class App extends Component {
  componentDidMount() {
    axios.get('/api/test')
    .then(res => console.log("got it: ", res))

    //extract the query string
    const query = this.props.location.search
    //right now, this is only returning user and provider
    if (query) {
      store.dispatch({type: HANDLE_QUERY, payload: query})

      //turned this back on for when I can retrieve from the cookies
      this.props.history.push(this.props.location.pathname)
    }
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
