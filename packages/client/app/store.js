import { combineReducers, configureStore} from '@reduxjs/toolkit';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { corpusReducer } from '../features/corpus';

const combinedReducer = combineReducers({
  corpus: corpusReducer
});

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    };
    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

export const makeStore = () =>
  configureStore({
    reducer,
  });

export const wrapper = createWrapper(makeStore, { debug: true });
