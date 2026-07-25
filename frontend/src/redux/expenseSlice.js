import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosClient } from '../utils/axiosClient';

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchAll',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/expenses/allExpenses', params);
            if (response.data.statusCode === 200) {
                return response.data.message; // Contains { expenses, total, page, pages }
            }
            return rejectWithValue(response.data.message);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchBudget = createAsyncThunk(
    'expenses/fetchBudget',
    async ({ userId, month, year }, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post('/budget/getBudget', { userId, month, year });
            if (response.data.statusCode === 200) {
                return response.data.message; // Contains { monthlyLimit, categoryLimits }
            }
            return rejectWithValue(response.data.message);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const expenseSlice = createSlice({
    name: 'expenses',
    initialState: {
        list: [],
        total: 0,
        page: 1,
        pages: 1,
        monthlyLimit: 0,
        categoryLimits: {},
        loading: false,
        error: null
    },
    reducers: {
        clearExpenses: (state) => {
            state.list = [];
            state.total = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.expenses;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBudget.fulfilled, (state, action) => {
                state.monthlyLimit = action.payload.monthlyLimit || 0;
                state.categoryLimits = action.payload.categoryLimits || {};
            });
    }
});

export const { clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
