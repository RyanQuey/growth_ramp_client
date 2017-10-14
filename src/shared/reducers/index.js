import { combineReducers, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from 'shared/sagas'
import userReducer from './user'
import postsReducer from './posts'
import plansReducer from './plans'
import currentPlanReducer from './currentPlan'
import providersReducer from './providers'
import errorReducer from './errors'
import alertReducer from './alerts'
import viewSettingsReducer from './viewSettings'

const rootReducer = combineReducers({
  // the current user
  user: userReducer,
  posts: postsReducer,
  plans: plansReducer,
  //the plan that the user is currently working on
  currentPlan: currentPlanReducer,
  //will probably get rid of this in the future?
  providers: providersReducer,
  errors: errorReducer,
  alerts: alertReducer,
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

/* SCHEMA
 provider
 channelConfiguration:
 messages
 plans
 posts
 users

 */

