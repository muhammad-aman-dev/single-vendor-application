// components/AddToCartButton.jsx
"use client";

import { useState } from "react";

export default function AddToCartButton({ product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.status !== "Active" || product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    setIsAdding(true);

    // Simulate cart storage (e.g., LocalStorage, Context, or Redux)
    setTimeout(() => {
      const existingCart = JSON.parse(localStorage.getItem("rebel_cart")) || [];
      const itemIndex = existingCart.findIndex((item) => item.productId === product.productId);

      if (itemIndex > -1) {
        existingCart[itemIndex].quantity += 1;
      } else {
        existingCart.push({
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || "",
          slug: product.slug,
          quantity: 1,
          maxStock: product.stock,
        });
      }

      localStorage.setItem("rebel_cart", JSON.stringify(existingCart));
      
      // Dispatch a custom storage event so other navbar/cart counter components update instantly
      window.dispatchEvent(new Event("cart-updated"));

      setIsAdding(false);
      setAdded(true);

      setTimeout(() => setAdded(false), 2000);
    }, 400);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdding}
      className={`w-full py-4 px-8 rounded-xl font-medium tracking-wide transition-all duration-300 flex items-center justify-center space-x-2 ${
        isOutOfStock
          ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
          : added
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
          : "bg-teal-500 hover:bg-teal-400 text-neutral-950 font-semibold shadow-lg shadow-teal-500/10 active:scale-[0.99]"
      }`}
    >
      {isAdding ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Securing Item...</span>
        </span>
      ) : added ? (
        <span className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added to Collection</span>
        </span>
      ) : isOutOfStock ? (
        <span>Sold Out</span>
      ) : (
        <span className="accent-text flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>Add to Cart</span>
        </span>
      )}
    </button>
  );
}