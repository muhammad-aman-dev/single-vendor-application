import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import adminAuthReducer from "./adminAuthSlice";
import cartReducer from "./cartSlice";
import shippingReducer from "./shippingSlice";

export const store =
  configureStore({
    reducer: {
      auth: authReducer,
      adminAuth: adminAuthReducer,
      cart: cartReducer,
      shipping: shippingReducer,
    },
  });
