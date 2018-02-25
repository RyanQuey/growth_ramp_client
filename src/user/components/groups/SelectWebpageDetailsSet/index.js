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

class SelectWebpageDetailsSet extends Component {
  constructor() {
    super()
    this.state = {
    }

    this.selectDetailsSet = this.selectDetailsSet.bind(this)
  }

  detailsSetOptions () {
    //default is first option, one week, which is what GA defaults to
    return [
      {
        label: "Overview",
        value: undefined,
      },
      {
        label: "Social Network Details",
        value: "SOCIAL_NETWORK_DETAILS",
      },
      {
        label: "Referral Details",
        value: "REFERRAL_DETAILS",
      },
      {
        label: "SEO/Keywords Data",
        value: "SEO_DATA",
      },
    ]
  }

  selectDetailsSet (option) {
    // clear previous dimension filters
    this.props.updateDimensionFilter()

    let params = {rowsBy: "landingPagePath", columnSets: ["behavior"], key: option.value}

    if (option.value === "SOCIAL_NETWORK_DETAILS") {
      // social is pretty messy, so let's just handle backend
      params.rowsBy = "source=social"

    } else if (option.value === "REFERRAL_DETAILS") {

      // referral might need to filter out social networks, but whatever
      params.rowsBy = "source=referral"

    } else if (option.value === "SEO_DATA") {
      params.rowsBy = "keyword"
      //params.columnSets = ["acquisition"]
      //keyword doesn't work with acquisisition metrics for some reason; just will have to use google search console
    } else if (option.value === undefined) {
      params.rowsBy = "channelGrouping"
    }

    formActions.setParams("Analytics", "tableDataset", params)

    // reset pagination, orderBy
    this.props.resetFilters()

    //might not use this; might just filter in backend, since these are more intensive operations
    //this.props.updateDimensionFilter(dimensionFilter)
    this.props.getAnalytics()
  }


  render () {
    const {pending, dirty, filters, tableDatasetParams} = this.props

    const detailsSetOptions = this.detailsSetOptions()
    const currentDetailsSet = detailsSetOptions.find((option) => option.value === tableDatasetParams.key)

    return (
      <Form className={classes.filtersForm} onSubmit={this.props.getAnalytics}>
        <Select
          label="Webpage Details Type"
          className={classes.select}
          options={detailsSetOptions}
          onChange={this.selectDetailsSet}
          currentOption={currentDetailsSet || detailsSetOptions[0]}
          name="detailsSetOptions"
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
    tableDatasetParams: Helpers.safeDataPath(state, "forms.Analytics.tableDataset.params", {}),
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectWebpageDetailsSet))
