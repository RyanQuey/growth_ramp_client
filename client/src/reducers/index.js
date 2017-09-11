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
 *
 *******************************
 * channelConfiguration: {
 *   id
 *   planId: (belongs to one plan)
 *   name: "PERSONAL_POST",
 *   provider: "FACEBOOK",
 *   utmDefaults: {
 *     custom: false or undefined if not, a string if yes
 *     enabled: Boolean
 *     medium: (use more constants...such as CHANNEL_NAME, PLAN_NAME, URL, )
 *     source:
 *     content:
 *     term:
 *   }  
 * },
 *******************************
 * messages
 *   id
 *   post: [postId]
 *   channel: can only have one channel( 
 *   utm: {
 *     custom: false or undefined if not, a string if yes
 *     enabled: Boolean
 *     medium: 
 *     source:
 *     content:
 *     term:
 *   },
 *   thumbnail: [string for data storage]
 *******************************
 * plans
 *   id
 *   name
 *   userId
 *   posts: [postId, postId, ...]
 *   channels: [array of channel IDs]
 *   providers: [array of string constantss of provider names] (necessary to toggle entire providers without messing up channel configurations)
 *   createdAt     
 *   updatedAt
 *******************************
 * posts
 *   id
 *   userId?? (perhaps could just use relation through the planId? depends on fire bases querying method)
 *   messages: [array of message IDs]
 *   planId: [planId]
 *   createdAt 
 *   status: ("published", "draft", "archived")    
 *
 * 
 *******************************
 * users
 *   id
 *   email: required
 *
 *   firstName
 *   lastName
 *   plans
 *******************************
 * userProviders
 *   id
 *   providerName
 *   channels: {
 *     name: ("PERSONAL_STATUS_UPDATE", etc),
 *     type: "group",
 *     lastPost (?)
 *   }
 *   token?? 
 *   email:
 *   displayName:
 *   profilePicture:
 *
 */

