import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import axiosInstance from "@/lib/axiosInstance";

/* -------------------------------------------------------------------------- */
/*                              INITIAL STATE                                 */
/* -------------------------------------------------------------------------- */

const CART_REVALIDATION_INTERVAL = 10 * 60 * 1000;
const CART_LAST_VALIDATED_KEY = "rebel-cart-last-validated";

const initialState = {
  items: [],

  itemCount: 0,

  initialized: false,

  syncing: false,

  removedItems: [],
};

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

const sameVariations = (
  a = {},
  b = {}
) => {
  if (
    !a ||
    typeof a !== "object" ||
    !b ||
    typeof b !== "object"
  ) {
    return false;
  }

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  if (
    aKeys.length !==
    bKeys.length
  ) {
    return false;
  }

  return aKeys.every(
    (key, index) =>
      key === bKeys[index] &&
      a[key] === b[key]
  );
};

const calculateItemCount = (
  items
) =>
  items.reduce(
    (total, item) =>
      total +
      Number(
        item.quantity || 0
      ),
    0
  );

const saveCart = (
  items
) => {
  if (
    typeof window !==
    "undefined"
  ) {
    localStorage.setItem(
      "rebel-cart",
      JSON.stringify(items)
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                        CART ITEM VALIDATION                                */
/* -------------------------------------------------------------------------- */

const normalizeCartItem = (
  item
) => {
  if (
    !item ||
    typeof item !==
      "object"
  ) {
    return null;
  }

  if (
    typeof item.productId !==
      "string" ||
    !item.productId.trim()
  ) {
    return null;
  }

  if (
    typeof item.name !==
      "string" ||
    !item.name.trim()
  ) {
    return null;
  }

  if (
    typeof item.slug !==
      "string" ||
    !item.slug.trim()
  ) {
    return null;
  }

  const price = Number(
    item.price
  );

  const stock = Number(
    item.stock
  );

  const requestedQuantity =
    Number(
      item.quantity
    );

  if (
    !Number.isFinite(
      price
    ) ||
    price < 0
  ) {
    return null;
  }

  if (
    !Number.isFinite(
      stock
    ) ||
    stock < 0
  ) {
    return null;
  }

  if (
    !Number.isInteger(
      requestedQuantity
    ) ||
    requestedQuantity < 1
  ) {
    return null;
  }

  /*
   * Do not allow a frontend cart item
   * to contain more than its known stock.
   */
  if (
    stock <= 0 ||
    requestedQuantity >
      stock
  ) {
    return null;
  }

  const variations =
    item.variations &&
    typeof item.variations ===
      "object" &&
    !Array.isArray(
      item.variations
    )
      ? item.variations
      : {};

  return {
    productId:
      item.productId,

    name:
      item.name,

    slug:
      item.slug,

    price,

    quantity:
      requestedQuantity,

    image:
      typeof item.image ===
        "string"
        ? item.image
        : "",

    variations,

    stock,
  };
};

/* -------------------------------------------------------------------------- */
/*                         VALIDATE LIVE STOCK                                */
/* -------------------------------------------------------------------------- */

export const validateCartStock = createAsyncThunk(
  "cart/validateCartStock",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { items } = getState().cart;

      if (!Array.isArray(items) || items.length === 0) {
        return {
          items: [],
          removed: [],
        };
      }

      const lastValidated = Number(
        localStorage.getItem(
          CART_LAST_VALIDATED_KEY
        )
      );

      const now = Date.now();

      if (
        lastValidated &&
        now - lastValidated <
          CART_REVALIDATION_INTERVAL
      ) {
        return {
          skipped: true,
          items,
        };
      }

      const payload = items.map((item) => ({
        productId: item.productId,
        variations: item.variations || {},
        quantity: item.quantity,
      }));

      const response = await axiosInstance.post(
        "/general/cart/validate",
        { items: payload }
      );

      localStorage.setItem(
        CART_LAST_VALIDATED_KEY,
        String(Date.now())
      );

      return {
        items: response.data.items || [],
        removed: response.data.removed || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to validate cart."
      );
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                SLICE                                       */
/* -------------------------------------------------------------------------- */

const cartSlice =
  createSlice({
    name: "cart",

    initialState,

    reducers: {
      /* ------------------------------------------------------------------ */
      /* HYDRATE                                                            */
      /* ------------------------------------------------------------------ */

      hydrateCart: (
        state
      ) => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        try {
          const saved =
            localStorage.getItem(
              "rebel-cart"
            );

          const parsed =
            saved
              ? JSON.parse(
                  saved
                )
              : [];

          const items =
            Array.isArray(
              parsed
            )
              ? parsed
                  .map(
                    normalizeCartItem
                  )
                  .filter(Boolean)
              : [];

          state.items =
            items;

          state.itemCount =
            calculateItemCount(
              items
            );

          state.initialized =
            true;
        } catch (error) {
          console.error(
            "Failed to hydrate cart:",
            error
          );

          state.items = [];

          state.itemCount = 0;

          state.initialized =
            true;

          localStorage.removeItem(
            "rebel-cart"
          );
        }
      },

      /* ------------------------------------------------------------------ */
      /* START SYNC                                                         */
      /* ------------------------------------------------------------------ */

      startCartSync: (
        state
      ) => {
        state.syncing =
          true;
      },

      /* ------------------------------------------------------------------ */
      /* SYNC CART                                                          */
      /* ------------------------------------------------------------------ */

      syncCart: (
        state,
        action
      ) => {
        const source =
          Array.isArray(
            action.payload
          )
            ? action.payload
            : [];

        const items =
          source
            .map(
              normalizeCartItem
            )
            .filter(Boolean);

        state.items =
          items;

        state.itemCount =
          calculateItemCount(
            items
          );

        state.syncing =
          false;

        state.initialized =
          true;

        saveCart(items);
      },

      /* ------------------------------------------------------------------ */
      /* CLEAR REMOVED                                                      */
      /* ------------------------------------------------------------------ */

      clearRemovedItems: (
        state
      ) => {
        state.removedItems =
          [];
      },

      /* ------------------------------------------------------------------ */
      /* ADD TO CART                                                        */
      /* ------------------------------------------------------------------ */

      addToCart: (
        state,
        action
      ) => {
        const newItem =
          normalizeCartItem(
            action.payload
          );

        /*
         * Never put malformed data into Redux/localStorage.
         */
        if (!newItem) {
          return;
        }

        const existingIndex =
          state.items.findIndex(
            (item) =>
              item.productId ===
                newItem.productId &&
              sameVariations(
                item.variations,
                newItem.variations
              )
          );

        if (
          existingIndex >=
          0
        ) {
          const item =
            state.items[
              existingIndex
            ];

          const oldQuantity =
            Number(
              item.quantity || 0
            );

          const requestedQuantity =
            oldQuantity +
            Number(
              newItem.quantity
            );

          const stock =
            Number(
              newItem.stock
            );

          /*
           * Never exceed known stock.
           */
          const newQuantity =
            Math.min(
              requestedQuantity,
              stock
            );

          /*
           * If stock is invalid/zero,
           * remove the item rather than
           * keeping quantity 0 in cart.
           */
          if (
            stock <= 0 ||
            newQuantity <= 0
          ) {
            state.items.splice(
              existingIndex,
              1
            );

            state.itemCount -=
              oldQuantity;

            saveCart(
              state.items
            );

            return;
          }

          item.quantity =
            newQuantity;

          item.name =
            newItem.name;

          item.slug =
            newItem.slug;

          item.price =
            newItem.price;

          item.image =
            newItem.image;

          item.stock =
            stock;

          state.itemCount +=
            newQuantity -
            oldQuantity;
        } else {
          state.items.push(
            newItem
          );

          state.itemCount +=
            newItem.quantity;
        }

        saveCart(
          state.items
        );
      },

      /* ------------------------------------------------------------------ */
      /* REMOVE                                                             */
      /* ------------------------------------------------------------------ */

      removeFromCart: (
        state,
        action
      ) => {
        const {
          productId,
          variations = {},
        } =
          action.payload ||
          {};

        const existingItem =
          state.items.find(
            (item) =>
              item.productId ===
                productId &&
              sameVariations(
                item.variations,
                variations
              )
          );

        if (
          existingItem
        ) {
          state.itemCount -=
            Number(
              existingItem.quantity ||
                0
            );
        }

        state.items =
          state.items.filter(
            (item) =>
              !(
                item.productId ===
                  productId &&
                sameVariations(
                  item.variations,
                  variations
                )
              )
          );

        saveCart(
          state.items
        );
      },

      /* ------------------------------------------------------------------ */
      /* UPDATE QUANTITY                                                    */
      /* ------------------------------------------------------------------ */

      updateQuantity: (
        state,
        action
      ) => {
        const {
          productId,
          variations = {},
          quantity,
          stock,
        } =
          action.payload ||
          {};

        const item =
          state.items.find(
            (cartItem) =>
              cartItem.productId ===
                productId &&
              sameVariations(
                cartItem.variations,
                variations
              )
          );

        if (!item) {
          return;
        }

        const oldQuantity =
          Number(
            item.quantity || 0
          );

        const maxStock =
          Number(
            stock ??
              item.stock ??
              0
          );

        if (
          !Number.isFinite(
            maxStock
          ) ||
          maxStock <= 0
        ) {
          state.items =
            state.items.filter(
              (cartItem) =>
                cartItem !==
                item
            );

          state.itemCount -=
            oldQuantity;

          saveCart(
            state.items
          );

          return;
        }

        const requestedQuantity =
          Number(
            quantity
          );

        if (
          !Number.isFinite(
            requestedQuantity
          )
        ) {
          return;
        }

        const newQuantity =
          Math.min(
            Math.max(
              Math.floor(
                requestedQuantity
              ),
              1
            ),
            maxStock
          );

        item.quantity =
          newQuantity;

        item.stock =
          maxStock;

        state.itemCount +=
          newQuantity -
          oldQuantity;

        saveCart(
          state.items
        );
      },

      /* ------------------------------------------------------------------ */
      /* CLEAR                                                              */
      /* ------------------------------------------------------------------ */

      clearCart: (
        state
      ) => {
        state.items = [];

        state.itemCount = 0;

        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.removeItem(
            "rebel-cart"
          );
        }
      },
    },

    /* -------------------------------------------------------------------- */
    /* EXTRA REDUCERS                                                       */
    /* -------------------------------------------------------------------- */

    extraReducers: (
      builder
    ) => {
      builder
        .addCase(
          validateCartStock.pending,
          (state) => {
            state.syncing =
              true;
          }
        )

        .addCase(
          validateCartStock.fulfilled,
          (
            state,
            action
          ) => {
            /*
             * IMPORTANT:
             * When validation is skipped because the cart
             * was already validated within 10 minutes,
             * keep the existing Redux cart exactly as it is.
             */
            if (
              action.payload?.skipped
            ) {
              state.syncing =
                false;

              state.initialized =
                true;

              return;
            }

            const {
              items,
              removed,
            } =
              action.payload;

            const normalizedItems =
              Array.isArray(
                items
              )
                ? items
                    .map(
                      normalizeCartItem
                    )
                    .filter(
                      Boolean
                    )
                : [];

            state.items =
              normalizedItems;

            state.itemCount =
              calculateItemCount(
                normalizedItems
              );

            state.removedItems =
              Array.isArray(
                removed
              )
                ? removed
                : [];

            state.syncing =
              false;

            state.initialized =
              true;

            saveCart(
              normalizedItems
            );
          }
        )

        .addCase(
          validateCartStock.rejected,
          (state) => {
            /*
             * Keep existing local cart
             * if server validation fails.
             */
            state.syncing =
              false;

            /*
             * Cart may already have been hydrated
             * locally, so make sure it remains initialized.
             */
            state.initialized =
              true;
          }
        );
    },
  });

export const {
  hydrateCart,
  startCartSync,
  syncCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  clearRemovedItems,
} =
  cartSlice.actions;

export default cartSlice.reducer;
