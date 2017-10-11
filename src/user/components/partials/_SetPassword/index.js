import { Component } from 'react'
import { Link } from 'react-router-dom'
import { Flexbox, Input, Button } from 'shared/components/elements'
import classes from './SetDisplayName.scss'

export default class SetPassword extends Component {
  render() {
    return (
      <Flexbox className={classes.fields} direction="column" justify="flex-start" align="center">
        <h1 color="primary">Welcome</h1>
        <div className={classes.form}>
          <h4>Please set your password before continuing:</h4>
        </div>
      </Flexbox>
    )
  }
}
