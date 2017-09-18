import { combineReducers, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from '../sagas'
import preloadingReducer from './preloading'
import userReducer from './user'
import postsReducer from './posts'
import plansReducer from './plans'
import currentPlanReducer from './currentPlan'
import tokensReducer from './tokens'

const rootReducer = combineReducers({
  preloadingStore: preloadingReducer,
  // the current user
  user: userReducer,
  posts: postsReducer,
  plans: plansReducer,
  //the plan that the user is currently working on
  currentPlan: currentPlanReducer,
  tokenInfo: tokensReducer
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

