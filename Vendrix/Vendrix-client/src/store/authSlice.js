import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('vendrix_user');
const initialState = {
  user:  stored ? JSON.parse(stored) : null,
  token: localStorage.getItem('vendrix_token') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload: { user, token } }) {
      state.user  = user;
      state.token = token;
      localStorage.setItem('vendrix_token', token);
      localStorage.setItem('vendrix_user', JSON.stringify(user));
    },
    logout(state) {
      state.user  = null;
      state.token = null;
      localStorage.removeItem('vendrix_token');
      localStorage.removeItem('vendrix_user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
