import { createReducer } from '@reduxjs/toolkit';
import { getCorpusList, setCorpusId, setAuthorPage, setConceptPage, setPaperPage,
  getAuthorList, getAuthorCount,
  getPaperList, getPaperCount, getPaperHistogram,
  getConceptCount, getConceptList} from './actions';

const initialState = {
  data: {
    corpusList: [],
    corpusId: -1,
    paperHistogram: [],
    authorList: [],
    authorCount: -1,
    authorPage: 0,
    paperList: [],
    paperCount: -1,
    paperPage: 0,
    conceptList: [],
    conceptCount: -1,
    conceptPage: 0
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
    .addCase(setConceptPage, (state, {payload}) => {
      state.data.conceptPage = payload;
    })
    .addCase(setPaperPage, (state, {payload}) => {
      state.data.paperPage = payload;
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
    })      // CORPUS PAPER GRID CONTROL
    .addCase(getPaperList.pending, (state) => {
      state.pending = true;
    })
    .addCase(getPaperList.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.paperList = payload;
    })
    .addCase(getPaperList.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
    .addCase(getPaperCount.pending, (state) => {
      state.pending = true;
    })
    .addCase(getPaperCount.fulfilled, (state, {payload}) => {
      state.pending = false
      state.data.paperCount = payload[0].paper_count;
    })
    .addCase(getPaperCount.rejected, (state) => {
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
           // CORPUS CONCEPT GRID CONTROL
    .addCase(getConceptList.pending, (state) => {
      state.pending = true;
    })
    .addCase(getConceptList.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.conceptList = payload;
    })
    .addCase(getConceptList.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
    .addCase(getConceptCount.pending, (state) => {
      state.pending = true;
    })
    .addCase(getConceptCount.fulfilled, (state, {payload}) => {
      state.pending = false
      state.data.conceptCount = payload[0].concept_count;
    })
    .addCase(getConceptCount.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
      // CORPUS PUBLICATION HISTOGRAM CONTROL
    .addCase(getPaperHistogram.pending, (state) => {
      state.pending = true;
    })
    .addCase(getPaperHistogram.fulfilled, (state, { payload }) => {
      state.pending = false;
      state.data.paperHistogram = payload
    })
    .addCase(getPaperHistogram.rejected, (state) => {
      state.pending = false;
      state.error = true;
    })
});

export default corpusReducer;
