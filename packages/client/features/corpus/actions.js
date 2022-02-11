import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import axios from 'axios';

export const setCorpusId = createAction('corpus/setCorpusId');
export const setAuthorPage = createAction('corpus/setAuthorPage');
export const setConceptPage = createAction('corpus/setConceptPage');
export const setPaperPage = createAction('corpus/setPaperPage');

export const selectCorpusId = createAsyncThunk('corpus/selectCorpusId',
    async (corpusId, thunkAPI) => {
      thunkAPI.dispatch(setCorpusId(corpusId))
      thunkAPI.dispatch(getAuthorList({corpusId:corpusId, pageSize:100, pageNumber:0}))
      thunkAPI.dispatch(getAuthorCount({corpusId:corpusId}))
      thunkAPI.dispatch(getPaperHistogram({corpusId:corpusId}))
      thunkAPI.dispatch(getConceptList({corpusId:corpusId, pageSize:100, pageNumber:0}))
      thunkAPI.dispatch(getConceptCount({corpusId:corpusId}))
      thunkAPI.dispatch(getPaperList({corpusId:corpusId, pageSize:100, pageNumber:0}))
      thunkAPI.dispatch(getPaperCount({corpusId:corpusId}))

});

export const getCorpusList = createAsyncThunk('corpus/getCorpusList', async () => {
  const res = await axios.get(`http://10.0.0.184:5001/api/list_corpora`)
  return res.data;
});

export const getAuthorList = createAsyncThunk('corpus/getAuthorList',
    async (hash, thunkAPI) => {
        thunkAPI.dispatch(setAuthorPage(hash.pageNumber))
        const url = 'http://10.0.0.184:5001/api/list_authors/'+hash.corpusId
            +'/'+hash.pageSize+'/'+hash.pageNumber;
        console.log(url)
        const res = await axios.get(url)
        return res.data;
});

export const getAuthorCount = createAsyncThunk('corpus/getAuthorCount', async (hash) => {
  const url = 'http://10.0.0.184:5001/api/count_authors/'+hash.corpusId;
  console.log(url)
  const res = await axios.get(url)
  return res.data;
});

export const getPaperHistogram = createAsyncThunk('corpus/getPaperHistogram', async (hash) => {
  const url = 'http://10.0.0.184:5001/api/count_papers_per_month/'+hash.corpusId;
  console.log(url)
  const res = await axios.get(url)
  return res.data;
});

export const getPaperList = createAsyncThunk('corpus/getPaperList',
    async (hash, thunkAPI) => {
        thunkAPI.dispatch(setConceptPage(hash.pageNumber))
        const url = 'http://10.0.0.184:5001/api/list_papers/'+hash.corpusId
            +'/'+hash.pageSize+'/'+hash.pageNumber;
        console.log(url)
        const res = await axios.get(url)
        return res.data;
});

export const getPaperCount = createAsyncThunk('corpus/getPaperCount', async (hash) => {
  const url = 'http://10.0.0.184:5001/api/count_papers/'+hash.corpusId;
  console.log(url)
  const res = await axios.get(url)
  return res.data;
});

export const getConceptList = createAsyncThunk('corpus/getConceptList',
    async (hash, thunkAPI) => {
        thunkAPI.dispatch(setConceptPage(hash.pageNumber))
        const url = 'http://10.0.0.184:5001/api/list_concepts/'+hash.corpusId
            +'/'+hash.pageSize+'/'+hash.pageNumber;
        console.log(url)
        const res = await axios.get(url)
        return res.data;
});

export const getConceptCount = createAsyncThunk('corpus/getConceptCount', async (hash) => {
  const url = 'http://10.0.0.184:5001/api/count_concepts/'+hash.corpusId;
  console.log(url)
  const res = await axios.get(url)
  return res.data;
});



