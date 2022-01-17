import { createAction, createSlice, createAsyncThunk, current } from '@reduxjs/toolkit'

const initialState = {
    corpus_id: -1,
    corpus_list: []
}

// Create the thunk
// NEEDS TO BE FIXED... THIS DOES NOT WORK...
// DO NOT CALL fetch_corpus_list
export const fetch_corpus_list = createAsyncThunk(
    'corpus/fetch_corpus_list',
    async(corpusList, {rejectWithValue}) => {
        try {
            const response = await fetch(
                'http://10.0.0.184:5001/api/list_corpora',
                {
                    method: 'GET',
                    body: JSON.stringify(corpusList),
                    header: {
                        'Content-Type': 'application/json',
                    },
                })
            const data = await response.json()
            return data
        } catch (err) {
            // You can choose to use the message attached to err or write a custom error
            return rejectWithValue(err)
        }
    }
)

const corpusSlice = createSlice({
  name: 'corpus',
  initialState,
  reducers: {
      select_corpus_id(state, action) {
          state.corpus_id = action.payload
      },
      set_corpus_list(state,action) {
          state.corpus_list = action.payload
      },
  },
  // NEEDS TO BE FIXED... THIS DOES NOT WORK...
  // DO NOT CALL fetch_corpus_list
  extraReducers: (builder) => {
    builder
        .addCase(fetch_corpus_list.fulfilled, (state, action) => {
            console.log('fetch_corpus_list.fulfilled')
            //state.corpus_list.length = 0
            //state.corpus_list.push(...action.payload)
            state.corpus_list = action.payload
            console.log(current(state))
        })
        .addCase(fetch_corpus_list.rejected, (state, action) => {
            console.log('fetch_corpus_list.rejected')
            if (action.payload) {
                state.error = action.payload.errorMessage
            } else {
                state.error = action.error.message
            }
            console.log(action)
            state.corpus_list =
                [{CORPUS_NAME: JSON.stringify(action) ,MONDO_CODES: 'MONDO:0016575', OA_PAPER_COUNT: 960, PAPER_COUNT: 2539, id: 0}]
        })
        .addDefaultCase((state, action) => {
            console.log(action)
        })
  },
})

export const { select_corpus_id, set_corpus_list } = corpusSlice.actions
export default corpusSlice.reducer

