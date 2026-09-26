"use client";

import { useMemo, useState } from "react";

const CART_KEY = "rebel-watches-cart";

export default function AddToCart({
  productId,
  price,
  stock,
  status,
  variations = [],
}) {
  const [selectedVariations, setSelectedVariations] =
    useState(() =>
      Object.fromEntries(
        variations.map((variation) => [
          variation.option,
          variation.values?.[0]?.value || "",
        ])
      )
    );

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariationData = useMemo(() => {
    return variations.flatMap((variation) => {
      const selected =
        selectedVariations[variation.option];

      return (
        variation.values?.filter(
          (value) => value.value === selected
        ) || []
      );
    });
  }, [variations, selectedVariations]);

  /*
   * Current variation price.
   */
  const currentPrice =
    selectedVariationData.length > 0
      ? selectedVariationData[
          selectedVariationData.length - 1
        ].price || price
      : price;

  /*
   * Current variation stock.
   */
  const currentStock =
    selectedVariationData.length > 0
      ? Math.min(
          ...selectedVariationData.map(
            (value) => Number(value.stock || 0)
          )
        )
      : Number(stock || 0);

  const outOfStock =
    status !== "Active" || currentStock <= 0;

  function getCart() {
    try {
      return JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new CustomEvent("rebel-cart-updated", {
        detail: cart,
      })
    );
  }

  function selectVariation(option, value) {
    setSelectedVariations((current) => ({
      ...current,
      [option]: value,
    }));

    setQuantity(1);
    setAdded(false);
  }

  function addToCart() {
    if (outOfStock) return;

    const cart = getCart();

    const variationKey = JSON.stringify(
      selectedVariations
    );

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === productId &&
        JSON.stringify(item.variations || {}) ===
          variationKey
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = Math.min(
        cart[existingIndex].quantity + quantity,
        currentStock
      );
    } else {
      cart.push({
        productId,
        quantity,
        variations: selectedVariations,
      });
    }

    saveCart(cart);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  return (
    <div className="space-y-7">

      {/* Variations */}
      {variations.map((variation) => (
        <div
          key={variation.option}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">
              {variation.option}
            </span>

            <span className="text-sm text-neutral-500">
              {selectedVariations[variation.option]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {variation.values?.map((value) => {
              const selected =
                selectedVariations[
                  variation.option
                ] === value.value;

              const unavailable =
                Number(value.stock || 0) <= 0;

              return (
                <button
                  key={value.value}
                  type="button"
                  disabled={unavailable}
                  onClick={() =>
                    selectVariation(
                      variation.option,
                      value.value
                    )
                  }
                  className={[
                    "rounded-xl border px-4 py-2.5 text-sm transition",
                    selected
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/30",
                    unavailable
                      ? "cursor-not-allowed opacity-30 line-through"
                      : "",
                  ].join(" ")}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Current price */}
      <div className="border-y border-white/10 py-5">
        <p className="text-2xl font-semibold text-white">
          ₨{" "}
          {Number(currentPrice).toLocaleString("en-PK")}
        </p>

        {!outOfStock && currentStock <= 5 && (
          <p className="mt-2 text-sm text-amber-400">
            Only {currentStock} left
          </p>
        )}

        {!outOfStock && currentStock > 5 && (
          <p className="mt-2 text-sm text-emerald-400">
            In stock and ready to ship
          </p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="mb-3 text-sm font-medium text-white">
          Quantity
        </p>

        <div className="flex h-12 w-fit overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <button
            type="button"
            disabled={quantity <= 1}
            onClick={() =>
              setQuantity((value) =>
                Math.max(1, value - 1)
              )
            }
            className="w-12 text-lg hover:bg-white/5 disabled:opacity-30"
          >
            −
          </button>

          <span className="flex w-12 items-center justify-center text-sm text-white">
            {quantity}
          </span>

          <button
            type="button"
            disabled={
              outOfStock ||
              quantity >= currentStock
            }
            onClick={() =>
              setQuantity((value) =>
                Math.min(
                  value + 1,
                  currentStock
                )
              )
            }
            className="w-12 text-lg hover:bg-white/5 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      {/* Add */}
      <button
        type="button"
        disabled={outOfStock}
        onClick={addToCart}
        className={[
          "h-14 w-full rounded-2xl text-sm font-semibold transition",
          outOfStock
            ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
            : added
              ? "bg-emerald-500 text-white"
              : "bg-white text-black hover:bg-neutral-200",
        ].join(" ")}
      >
        {outOfStock
          ? "Out of Stock"
          : added
            ? "Added to Cart ✓"
            : "Add to Cart"}
      </button>

      {/* Small trust row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs font-medium text-white">
            Delivery
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Across Pakistan
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs font-medium text-white">
            Secure
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Safe checkout
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs font-medium text-white">
            Returns
          </p>
          <p className="mt-1 text-[11px] text-neutral-500">
            Easy returns
          </p>
        </div>
      </div>
    </div>
  );
}