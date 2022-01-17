import {AnyAction} from 'redux';
import {HYDRATE} from 'next-redux-wrapper';
import {diff} from 'jsondiffpatch';

const initialState = {}

const nextCoreReducer = (state = initialState, action) => {
    switch (action.type) {
        case HYDRATE:
            const stateDiff = diff(state, action.payload);
            console.log('HYDRATE action handler', {
                stateDiff
            });
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
};

export default nextCoreReducer;