import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        currentUser: JSON.parse(localStorage.getItem('User')) || null
    },
    reducers: {
        setUser: (state, action) => {
            state.currentUser = action.payload;
            localStorage.setItem('User', JSON.stringify(action.payload));
        },
        logoutUser: (state) => {
            state.currentUser = null;
            localStorage.removeItem('User');
            localStorage.removeItem('Token');
        }
    }
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
