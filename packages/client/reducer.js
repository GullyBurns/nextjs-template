import { combineReducers } from 'redux'

import corpusReducer from './features/corpusSlice'

const rootReducer = combineReducers({
    corpus: corpusReducer,
})

export default rootReducer