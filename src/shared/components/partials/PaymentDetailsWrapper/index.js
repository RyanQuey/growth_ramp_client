import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { errorActions, alertActions } from 'shared/actions'
import { Button, Flexbox, Input, Checkbox } from 'shared/components/elements'
import { PaymentDetails } from 'shared/components/partials'
import {StripeProvider, Elements} from 'react-stripe-elements'

import classes from './style.scss'

const stripeApiPublicKey = window.location.host.includes("test") ? (
  "pk_test_NLX4CC6IWgVcAa2vLtIWnc2f" //www.local.test or test.growthramp.io
) : (
  "pk_live_OwkOqNMCFFt78Ox1eQaFz8Xe" //live key; for production only
)

class PaymentDetailsWrapper extends Component {
  constructor() {
    super()
    this.state = {
    }
  }


  render() {
    return (
      <StripeProvider apiKey={stripeApiPublicKey}>
        <Elements>
          <PaymentDetails />
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentDetailsWrapper)
