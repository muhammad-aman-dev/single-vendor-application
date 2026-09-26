import {
    createAsyncThunk,
    createSlice,
  } from "@reduxjs/toolkit";
  
  import axiosInstance from "@/lib/axiosInstance";
  
  const initialState = {
    name: "",
    fee: 0,
    loading: false,
    initialized: false,
  };
  
  export const fetchActiveShipping =
    createAsyncThunk(
      "shipping/fetchActiveShipping",
      async (_, { rejectWithValue }) => {
        try {
          const response =
            await axiosInstance.get(
              "/general/shipping/get-active"
            );
  
          return response.data.shipping;
        } catch (error) {
          return rejectWithValue(
            error.response?.data?.message ||
              "Failed to fetch shipping charges."
          );
        }
      }
    );
  
  const shippingSlice =
    createSlice({
      name: "shipping",
  
      initialState,
  
      reducers: {},
  
      extraReducers: (builder) => {
        builder
          .addCase(
            fetchActiveShipping.pending,
            (state) => {
              state.loading = true;
            }
          )
  
          .addCase(
            fetchActiveShipping.fulfilled,
            (state, action) => {
              state.name =
                action.payload?.name || "";
  
              state.fee =
                Number(
                  action.payload?.fee || 0
                );
  
              state.loading = false;
              state.initialized = true;
            }
          )
  
          .addCase(
            fetchActiveShipping.rejected,
            (state) => {
              state.loading = false;
              state.initialized = true;
            }
          );
      },
    });
  
  export default shippingSlice.reducer;