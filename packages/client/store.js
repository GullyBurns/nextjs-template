import { configureStore } from '@reduxjs/toolkit'
import corpusReducer from "./features/corpusSlice";
import { useDispatch, useSelector } from 'react-redux'
import {fetch_corpus_list} from 'features/corpusSlice'
import { unwrapResult } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
      corpus: corpusReducer
  },
})

/*store.dispatch(fetch_corpus_list())
    .then(unwrapResult)
    .then((originalPromiseResult) => {
      console.log(originalPromiseResult)
    })
    .catch((rejectedValueOrSerializedError) => {
      console.log(rejectedValueOrSerializedError)      // handle result here
    })*/
