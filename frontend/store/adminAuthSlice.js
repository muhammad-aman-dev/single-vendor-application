import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAdminLoggedIn: false,
  adminUser: null,
};

export const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    loginAdmin: (state, action) => {
      state.isAdminLoggedIn = true;
      state.adminUser = action.payload || { email: "admin@store.com", name: "Admin" };
    },
    logoutAdmin: (state) => {
      state.isAdminLoggedIn = false;
      state.adminUser = null;
    },
  },
});

export const { loginAdmin, logoutAdmin } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;