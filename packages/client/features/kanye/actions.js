import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getKanyeQuote = createAsyncThunk('kanye/kanyeQuote', async () => {
  const response = await axios.get('https://api.kanye.rest/');
  console.log(response)
  return response.data;
});
