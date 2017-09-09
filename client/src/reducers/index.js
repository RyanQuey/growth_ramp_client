import { combineReducers, createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from '../sagas'
import preloadingReducer from './preloading'
import userReducer from './user'
import postsReducer from './posts'
import tokensReducer from './tokens'

const rootReducer = combineReducers({
  preloadingStore: preloadingReducer,
  user: userReducer,
  posts: postsReducer,
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

