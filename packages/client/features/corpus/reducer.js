import { createReducer } from '@reduxjs/toolkit';
import { getCorpusList, setCorpusId, getAuthorList, setAuthorPage, getAuthorCount, getPaperHistogram} from './actions';

const initialState = {
  data: {
    corpusList: [],
    corpusId: -1,
    paperHistogram: [],
    authorList: [],
    authorCount: -1,
    authorPage: 0
  },
  pending: false,
  error: false,
};

export const corpusReducer = createReducer(initialState, (builder) => {
  builder
      // SETTING PARAMETERS IN MODEL FROM APP
    .addCase(setCorpusId, (state, {payload}) => {
      state.data.corpusId = payload;
      state.data.authorPage = 0;
    })
    .addCase(setAuthorPage, (state, {payload}) => {
      state.data.authorPage = payload;
    })
      // LOADING DATA FROM SERVICES
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
      // CORPUS AUTHOR GRID CONTROL
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
    .addCase(getAuthorCount.pending, (state) => {
      state.pending = true;
    })
    .addCase(getAuthorCount.fulfilled, (state, {payload}) => {
      state.pending = false
      state.data.authorCount = payload[0].author_count;
    })
    .addCase(getAuthorCount.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
      // CORPUS PUBLICATION HISTOGRAM CONTROL
    .addCase(getPaperHistogram.pending, (state) => {
      state.pending = true;
    })
    .addCase(getPaperHistogram.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.paperHistogram = payload.map(tuple => {
        return {
          'paper_count': tuple.paper_count,
          'date': new Date(tuple.date)
        }
      });
    })
    .addCase(getPaperHistogram.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })

});

export default corpusReducer;
