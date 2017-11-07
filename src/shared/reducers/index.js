import { combineReducers, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from 'shared/sagas'

import alertReducer from './alerts'
import errorReducer from './errors'
import formsReducer from './forms'
import postsReducer from './posts'
import plansReducer from './plans'
import currentPlanReducer from './currentPlan'
//import currentPostReducer from './currentPost'
import providerAccountsReducer from './providerAccounts'
import userReducer from './user'
import viewSettingsReducer from './viewSettings'
import workgroupsReducer from './workgroups'

const rootReducer = combineReducers({
  alerts: alertReducer,
  //the plan that the user is currently working on
  currentPlan: currentPlanReducer,
  //the post that the user is currently working on
  //NOTE just using route params
  //currentPost: currentPostReducer,
  errors: errorReducer,
  posts: postsReducer,
  forms: formsReducer,
  plans: plansReducer,
  workgroups: workgroupsReducer,
  //all of the provider accounts that user is the owner of, or has permission to use
  providerAccounts: providerAccountsReducer,
  // the current user
  user: userReducer,
  viewSettings: viewSettingsReducer,
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
