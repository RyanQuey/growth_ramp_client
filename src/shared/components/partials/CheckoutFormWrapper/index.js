import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { CheckoutForm } from 'shared/components/partials'
import {StripeProvider, Elements} from 'react-stripe-elements'

import classes from './style.scss'

class CheckoutFormWrapper extends Component {
  constructor() {
    super()
    this.state = {
    }

  }


  render() {
    return (
      <StripeProvider apiKey="   ">
        <Elements>
          <CheckoutForm />
        </Elements>
      </StripeProvider>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}
const mapStateToProps = (state) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckoutFormWrapper)
