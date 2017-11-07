import { Component } from 'react';
import { connect } from 'react-redux'
import { Button } from 'shared/components/elements'

//shows up as the most of the content-container in a browser, or totally conditionally in mobile after provider has been chosen
//maybe all of this should fit in its parent instead
const PermissionRow = ({permission}) => {

  return (
    <Flexbox >
      <div className={`${classes.tableHeader} ${classes.columnOne}`}>{permission.userId.name}</div>
      <div className={`${classes.tableHeader} ${classes.columnTwo}`}>Access</div>
      <div className={`${classes.tableHeader} ${classes.columnThree}`}></div>
    </Flexbox>
  )

}

const mapStateToProps = state => {
  return {
    user: state.user,
    tokenInfo: state.tokenInfo,
    currentPlan: state.currentPlan,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

const ConnectedPermissionRow = connect(mapStateToProps, mapDispatchToProps)(PermissionRow)
export default ConnectedPermissionRow


