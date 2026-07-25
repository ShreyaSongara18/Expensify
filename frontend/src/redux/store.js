import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import userReducer from './userSlice';
import expenseReducer from './expenseSlice';

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        user: userReducer,
        expenses: expenseReducer
    }
});
export default store;
