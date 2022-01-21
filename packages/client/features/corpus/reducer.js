import { createReducer } from '@reduxjs/toolkit';
import { getCorpusList, setCorpusId, getAuthorList } from './actions';

const initialState = {
  data: {
    corpusList: [],
    corpusId: -1,
    authorList: []
  },
  pending: false,
  error: false,
};

export const corpusReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(getCorpusList.pending, (state) => {
      state.pending = true;
    })
    .addCase(getCorpusList.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.corpusList = payload;
    })
    .addCase(getCorpusList.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
    .addCase(setCorpusId, (state, {payload}) => {
      state.data.corpusId = payload;
    })
    .addCase(getAuthorList.pending, (state) => {
      state.pending = true;
    })
    .addCase(getAuthorList.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.authorList = payload;
    })
    .addCase(getAuthorList.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
});

export default corpusReducer;
