"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  hydrateCart,
  validateCartStock,
} from "@/store/cartSlice";
import { fetchActiveShipping } from "@/store/shippingSlice";

export default function CartInitializer() {
  const dispatch = useDispatch();

  const initialized = useSelector(
    (state) => state.cart.initialized
  );

  const items = useSelector(
    (state) => state.cart.items
  );

  const validated = useRef(false);

  useEffect(() => {
    dispatch(hydrateCart());
    dispatch(fetchActiveShipping());
  }, [dispatch]);

  useEffect(() => {
    if (!initialized || validated.current) {
      return;
    }

    validated.current = true;

    if (!items?.length) {
      return;
    }

    dispatch(validateCartStock());
  }, [initialized, items, dispatch]);

  return null;
}