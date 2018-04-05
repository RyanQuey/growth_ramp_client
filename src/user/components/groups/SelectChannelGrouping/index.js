import { Component } from 'react';
import { connect } from 'react-redux'
import DatePicker from 'react-datepicker'
import {
  FETCH_ALL_GA_ACCOUNTS_REQUEST,
  SET_ANALYTICS_FILTER,
} from 'constants/actionTypes'
import { Button, Flexbox, Icon, Form } from 'shared/components/elements'
import { Select } from 'shared/components/groups'
import { SocialLogin } from 'shared/components/partials'
import { PROVIDERS, PROVIDER_IDS_MAP } from 'constants/providers'
import { TIME_RANGE_OPTIONS, } from 'constants/analytics'
import {formActions, alertActions} from 'shared/actions'
import {
  withRouter,
} from 'react-router-dom'
import classes from './style.scss'

class ChannelGroupingFilter extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.selectChannelGrouping = this.selectChannelGrouping.bind(this)
  }

  channelGroupingFilterOptions () {
    //default is first option, one week, which is what GA defaults to
    return [
      {
        label: "All Traffic",
        value: undefined,
      },
      {
        label: "Organic Search",
        value: "Organic Search",
      },
      {
        label: "Social",
        value: "Social",
      },
      {
        label: "Direct",
        value: "Direct",
      },
      {
        label: "Referral",
        value: "Referral",
      },
    ]
  }

  selectChannelGrouping (option) {
    const dimensionFilter = {
      dimensionName: `ga:channelGrouping`,
      operator: "EXACT",
      expressions: [option.value]
    }

    this.props.updateDimensionFilter(dimensionFilter)
    this.props.getAnalytics()
  }


  render () {
    const {pending, dirty, filters} = this.props

    const {dimensionFilterClauses} = filters
    const channelGroupingFilter = dimensionFilterClauses && dimensionFilterClauses.filters.find((clause) => clause.dimensionName === "ga:channelGrouping")
    const channelGroupingValue = channelGroupingFilter && channelGroupingFilter.expressions[0] //assuming only one for now


    const channelGroupingFilterOptions = this.channelGroupingFilterOptions()
    // == so null can == undefined
    const currentChannelGroupingOption = channelGroupingFilterOptions.find((option) => option.value == channelGroupingValue)

    return (
      <Form className={classes.filtersForm} onSubmit={this.props.getAnalytics}>
        <Select
          label="Dataset"
          className={classes.select}
          options={channelGroupingFilterOptions}
          onChange={this.selectChannelGrouping}
          currentOption={channelGroupingValue || channelGroupingFilterOptions[0]}
          name="timerange"
        />
      </Form>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const mapStateToProps = state => {
  return {
    filters: Helpers.safeDataPath(state, "forms.Analytics.filters.params"),
    dirty: Helpers.safeDataPath(state, "forms.Analytics.filters.dirty"),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ChannelGroupingFilter))
