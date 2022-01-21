import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import axios from 'axios';

export const setCorpusId = createAction('corpus/setCorpusId');

export const selectCorpusId = createAsyncThunk('corpus/selectCorpusId',
    async (corpusId, thunkAPI) => {
      thunkAPI.dispatch(setCorpusId(corpusId))
      thunkAPI.dispatch(getAuthorList({corpusId:corpusId, pageSize:25, pageNumber:0}))
});

export const getCorpusList = createAsyncThunk('corpus/getCorpusList', async () => {
  const res = await axios.get(`http://10.0.0.184:5001/api/list_corpora`)
  return res.data;
});

export const getAuthorList = createAsyncThunk('corpus/getAuthorList', async (hash) => {
  const url = 'http://10.0.0.184:5001/api/list_authors/'+hash.corpusId
      +'/'+hash.pageSize+'/'+hash.pageNumber;
  console.log(url)
  const res = await axios.get(url)
  return res.data;
});




