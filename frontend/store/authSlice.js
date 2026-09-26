import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isInitialized: false,
  user: null, 
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state, action) => {
      state.user = action.payload;
      state.isInitialized = true;
    },
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { initializeAuth, login, logout } = authSlice.actions;
export default authSlice.reducer;