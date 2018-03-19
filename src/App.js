import { Component } from 'react';
import logo from 'images/logo.png';
import User from 'user/components'
import { connect } from 'react-redux'
import classes from 'App.scss';
import {
  withRouter,
} from 'react-router-dom'
import handleQuery from 'helpers/handleQuery'

class App extends Component {
  // make sure runs first, or login/signup currently will just do login, will never start at signup due to race conditions
  componentWillMount() {
    /*axios.get('/api/test')
    .then(res => console.log("got it: ", res))*/

    //extract the query string
    const query = this.props.location.search
    //right now, this is only returning user and provider
    if (query) {
      const cb = (options) => {
        if (options.sendHome) {
          this.props.history.push("/")
        } else {
          //strips off the query string
          this.props.history.push(this.props.location.pathname)
        }
      }

      handleQuery(query, cb);
    }
  }

  render() {
    return (
      <div className={`${classes.App} desktop`}>
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
