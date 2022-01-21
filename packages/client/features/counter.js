import { createReducer } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';

export const increment = createAction('counter/increment');
export const decrement = createAction('counter/decrement');
export const incrementByAmount = createAction('counter/incrementByAmount');

const initialState = {
  value: 0,
};

export const counterReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(increment, (state) => {
      state.value++;
    })
    .addCase(decrement, (state) => {
      state.value--;
    })
    .addCase(incrementByAmount, (state, action) => {
      state.value += action.payload;
    });
});
