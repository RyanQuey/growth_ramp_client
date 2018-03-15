import { combineReducers, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from 'shared/sagas'

import alertReducer from './alerts'
import analytics from './analytics'
import contentAudit from './contentAudit'
import errorReducer from './errors'
import formsReducer from './forms'
import campaignsReducer from './campaigns'
import goals from './goals'
import plansReducer from './plans'
import accountSubscriptionReducer from './accountSubscription'
import currentPlanReducer from './currentPlan'
import currentCampaignReducer from './currentCampaign'
import currentPostReducer from './currentPost'
import currentPostTemplateReducer from './currentPostTemplate'
import providerAccountsReducer from './providerAccounts'
import userReducer from './user'
import viewSettingsReducer from './viewSettings'
import workgroupsReducer from './workgroups'
import websites from './websites'

const rootReducer = combineReducers({
  analytics,
  accountSubscription: accountSubscriptionReducer,
  alerts: alertReducer,
  contentAudit,
  //the plan that the user is currently working on OR viewing
  currentPlan: currentPlanReducer,
  //the postTemplate that the user is currently working on
  currentPostTemplate: currentPostTemplateReducer,
  //the post that the user is currently working on
  currentPost: currentPostReducer,
  //the campaign that the user is currently working on
  currentCampaign: currentCampaignReducer,
  errors: errorReducer,
  campaigns: campaignsReducer,
  forms: formsReducer,
  goals,
  plans: plansReducer,
  workgroups: workgroupsReducer,
  //all of the provider accounts that user is the owner of, or has permission to use
  providerAccounts: providerAccountsReducer,
  // the current user
  user: userReducer,
  viewSettings: viewSettingsReducer,
  websites,
})

const sagaMiddleware = createSagaMiddleware()

window.store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(sagaMiddleware)
  )
)

sagaMiddleware.run(rootSaga)

export default window.store
