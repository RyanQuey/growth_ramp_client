import { Component } from 'react';
import { connect } from 'react-redux'
import { PROVIDERS } from 'constants/providers'
import {
  withRouter,
} from 'react-router-dom'
import { Card, CardHeader, Flexbox, Button } from 'shared/components/elements'
import classes from './style.scss'

class ProviderCard extends Component {
  constructor() {
    super()

  }

  render () {
    const { provider, selected, onClick, height, maxWidth, backgroundColor } = this.props

    return (
      <Card selected={selected} onClick={onClick} height={height} maxWidth={maxWidth} background={backgroundColor} >
        <CardHeader title={PROVIDERS[provider].name}/>

        <div>
          <h4>Add a {PROVIDERS[provider].name} post</h4>
        </div>
      </Card>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    providerProviders: state.providerProviders,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProviderCard))
