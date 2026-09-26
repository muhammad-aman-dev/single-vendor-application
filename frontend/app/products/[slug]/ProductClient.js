"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  PackageCheck,
  Watch,
  Tag,
  Layers3,
  CircleDollarSign,
  BadgeCheck,
  AlertTriangle,
  Eye,
  BarChart3,
} from "lucide-react";

import Link from "next/link";

import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";

import ProductDescription from "./ProductDescription";

const FALLBACK_IMAGE = "/watch-fallback.webp";

const VALID_GENDERS = ["Men", "Women", "Unisex", "Kids", "All"];

const VALID_STATUSES = ["Active", "Out Of Stock", "Inactive"];

/* -------------------------------------------------------------------------- */
/*                                VALIDATION                                  */
/* -------------------------------------------------------------------------- */

function isNonNegativeNumber(value) {
  const number = Number(value);

  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(number) &&
    number >= 0
  );
}

function isValidProductImage(image) {
  return Boolean(
    image &&
      typeof image === "object" &&
      typeof image.url === "string" &&
      image.url.trim() &&
      typeof image.alt === "string" &&
      image.alt.trim() &&
      image.alt.trim().length <= 150
  );
}

function validateProduct(product) {
  const errors = [];

  if (!product || typeof product !== "object") {
    return {
      valid: false,
      errors: ["Invalid product data."],
    };
  }

  // Required string fields
  const requiredStrings = [
    ["name", product.name],
    ["slug", product.slug],
    ["description", product.description],
    ["category", product.category],
  ];

  requiredStrings.forEach(([field, value]) => {
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`${field} is required.`);
    }
  });

  // Gender enum
  if (!VALID_GENDERS.includes(product.gender)) {
    errors.push("Invalid product gender.");
  }

  // Status enum
  if (!VALID_STATUSES.includes(product.status)) {
    errors.push("Invalid product status.");
  }

  // Price
  if (!isNonNegativeNumber(product.price)) {
    errors.push("Product price must be a non-negative number.");
  }

  // Compare price is optional
  if (
    product.comparePrice !== undefined &&
    product.comparePrice !== null &&
    !isNonNegativeNumber(product.comparePrice)
  ) {
    errors.push("Compare price must be a non-negative number.");
  }

  // Stock
  if (
    product.stock !== undefined &&
    product.stock !== null &&
    !isNonNegativeNumber(product.stock)
  ) {
    errors.push("Product stock must be a non-negative number.");
  }

  // Images are required and must contain at least one image
  if (!Array.isArray(product.images) || product.images.length === 0) {
    errors.push("At least one product image is required.");
  } else {
    product.images.forEach((image, index) => {
      if (!isValidProductImage(image)) {
        errors.push(`Product image ${index + 1} is invalid.`);
      }
    });
  }

  // Variations
  if (product.variations !== undefined && product.variations !== null) {
    if (!Array.isArray(product.variations)) {
      errors.push("Product variations must be an array.");
    } else {
      product.variations.forEach((variation, variationIndex) => {
        if (
          !variation ||
          typeof variation.option !== "string" ||
          !variation.option.trim()
        ) {
          errors.push(`Variation ${variationIndex + 1} has an invalid option.`);
        }

        if (!Array.isArray(variation.values)) {
          errors.push(
            `Variation ${variationIndex + 1} values must be an array.`
          );

          return;
        }

        variation.values.forEach((value, valueIndex) => {
          if (
            !value ||
            typeof value.value !== "string" ||
            !value.value.trim()
          ) {
            errors.push(
              `Variation ${variationIndex + 1}, value ${
                valueIndex + 1
              } is invalid.`
            );
          }

          if (!isNonNegativeNumber(value.stock)) {
            errors.push(
              `Stock for variation ${variationIndex + 1}, value ${
                valueIndex + 1
              } must be a non-negative number.`
            );
          }
        });
      });
    }
  }

  // SEO
  if (product.seo !== undefined && product.seo !== null) {
    if (typeof product.seo !== "object" || Array.isArray(product.seo)) {
      errors.push("SEO data is invalid.");
    } else {
      if (
        product.seo.title !== undefined &&
        product.seo.title !== null &&
        typeof product.seo.title !== "string"
      ) {
        errors.push("SEO title must be a string.");
      }

      if (
        typeof product.seo.title === "string" &&
        product.seo.title.trim().length > 70
      ) {
        errors.push("SEO title cannot exceed 70 characters.");
      }

      if (
        product.seo.description !== undefined &&
        product.seo.description !== null &&
        typeof product.seo.description !== "string"
      ) {
        errors.push("SEO description must be a string.");
      }

      if (
        typeof product.seo.description === "string" &&
        product.seo.description.trim().length > 160
      ) {
        errors.push("SEO description cannot exceed 160 characters.");
      }

      if (
        product.seo.keywords !== undefined &&
        product.seo.keywords !== null &&
        !Array.isArray(product.seo.keywords)
      ) {
        errors.push("SEO keywords must be an array.");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/* -------------------------------------------------------------------------- */
/*                              STOCK HELPERS                                 */
/* -------------------------------------------------------------------------- */

function getBaseStock(product) {
  const stock = Number(product?.stock);

  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
}

function getVariationStock(variation, selectedValue) {
  if (!variation || !selectedValue) {
    return null;
  }

  const value = Array.isArray(variation.values)
    ? variation.values.find((item) => item?.value === selectedValue)
    : null;

  if (!value) {
    return null;
  }

  const stock = Number(value.stock);

  return Number.isFinite(stock) && stock >= 0 ? stock : 0;
}

/**
 * Because the schema does not store combination-level stock,
 * the effective stock of a selected configuration is the minimum
 * stock across:
 *
 * product.stock
 * variation value #1 stock
 * variation value #2 stock
 * ...
 */
function calculateEffectiveStock(product, selectedVariations) {
  const baseStock = getBaseStock(product);

  if (baseStock <= 0) {
    return 0;
  }

  const variations = Array.isArray(product?.variations)
    ? product.variations
    : [];

  if (variations.length === 0) {
    return baseStock;
  }

  const selectedStocks = [];

  for (const variation of variations) {
    const option = variation?.option;

    if (!option) {
      continue;
    }

    const selectedValue = selectedVariations?.[option];

    if (!selectedValue) {
      continue;
    }

    const stock = getVariationStock(variation, selectedValue);

    if (stock === null) {
      return 0;
    }

    selectedStocks.push(stock);
  }

  if (selectedStocks.length === 0) {
    return baseStock;
  }

  return Math.min(baseStock, ...selectedStocks);
}

function slugify(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9&-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getVariationOptions(product) {
  return Array.isArray(product?.variations) ? product.variations : [];
}

function getRequiredVariationOptions(product) {
  return getVariationOptions(product)
    .map((variation) => variation?.option)
    .filter(Boolean);
}

function areAllVariationsSelected(product, selectedVariations) {
  const options = getRequiredVariationOptions(product);

  if (options.length === 0) {
    return true;
  }

  return options.every((option) => {
    const value = selectedVariations?.[option];

    return typeof value === "string" && value.trim().length > 0;
  });
}

function validateSelectedVariations(product, selectedVariations) {
  const variations = getVariationOptions(product);

  const errors = [];

  for (const variation of variations) {
    const option = variation?.option;

    if (!option) {
      errors.push("Invalid variation option.");
      continue;
    }

    const selectedValue = selectedVariations?.[option];

    if (typeof selectedValue !== "string" || !selectedValue.trim()) {
      errors.push(`Please select ${option}.`);

      continue;
    }

    const exists = Array.isArray(variation.values)
      ? variation.values.some((item) => item?.value === selectedValue)
      : false;

    if (!exists) {
      errors.push(`Invalid ${option} selection.`);
    }
  }

  return errors;
}

/* -------------------------------------------------------------------------- */
/*                              FORMAT HELPERS                                */
/* -------------------------------------------------------------------------- */

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-US");
}

/* -------------------------------------------------------------------------- */
/*                              STOCK BADGE                                   */
/* -------------------------------------------------------------------------- */

function StockIndicator({ stock, status }) {
  if (status !== "Active") {
    return (
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-40" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
          {status === "Inactive" ? "Product unavailable" : "Out of stock"}
        </span>
      </div>
    );
  }

  if (stock <= 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-ping opacity-50" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
          Out of stock
        </span>
      </div>
    );
  }

  if (stock <= 3) {
    return (
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-ping opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-400 animate-pulse">
          Very low stock left
        </span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-orange-400" />

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
          Low stock left
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
      </span>

      <span className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
        In stock
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

export default function ProductClient({ product }) {
  const dispatch = useDispatch();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [selectedVariations, setSelectedVariations] = useState({});

  const [validationErrors, setValidationErrors] = useState([]);

  /* ---------------------------------------------------------------------- */
  /* PRODUCT VALIDATION                                                     */
  /* ---------------------------------------------------------------------- */

  const productValidation = useMemo(() => validateProduct(product), [product]);

  /* ---------------------------------------------------------------------- */
  /* INITIAL PRODUCT STATE                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!product) {
      return;
    }

    const images =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [];

    setSelectedImageIndex(0);

    setQuantity(1);
    setValidationErrors([]);

    const initialVariations = {};

    const variations = getVariationOptions(product);

    variations.forEach((variation) => {
      const values = Array.isArray(variation?.values) ? variation.values : [];

      const firstAvailable = values.find(
        (value) => Number(value?.stock || 0) > 0
      );

      /*
       * Do not automatically select variations.
       *
       * The schema does not define a default variation,
       * therefore the customer should explicitly choose
       * every variation.
       */
      if (values.length === 1 && firstAvailable) {
        initialVariations[variation.option] = firstAvailable.value;
      }
    });

    setSelectedVariations(initialVariations);
  }, [product]);

  /* ---------------------------------------------------------------------- */
  /* IMAGES                                                                 */
  /* ---------------------------------------------------------------------- */

  const images = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images.filter(isValidProductImage);
    }

    return [];
  }, [product]);

  /* ---------------------------------------------------------------------- */
  /* STOCK / VARIATION STATE                                                */
  /* ---------------------------------------------------------------------- */

  const {
    finalPrice,
    baseStock,
    availableStock,
    allSelected,
    hasVariations,
    selectedVariationStocks,
  } = useMemo(() => {
    if (!product) {
      return {
        finalPrice: 0,
        baseStock: 0,
        availableStock: 0,
        allSelected: false,
        hasVariations: false,
        selectedVariationStocks: [],
      };
    }

    const price = Number(product.price);

    const stock = getBaseStock(product);

    const variations = getVariationOptions(product);

    const hasVariation = variations.length > 0;

    const selected = areAllVariationsSelected(product, selectedVariations);

    const effectiveStock = selected
      ? calculateEffectiveStock(product, selectedVariations)
      : stock;

    const stocks = [];

    variations.forEach((variation) => {
      const selectedValue = selectedVariations?.[variation.option];

      if (!selectedValue) {
        return;
      }

      const variationStock = getVariationStock(variation, selectedValue);

      if (variationStock !== null) {
        stocks.push({
          option: variation.option,
          value: selectedValue,
          stock: variationStock,
        });
      }
    });

    return {
      finalPrice: Number.isFinite(price) && price >= 0 ? price : 0,

      baseStock: stock,

      availableStock: product.status === "Active" ? effectiveStock : 0,

      allSelected: selected,

      hasVariations: hasVariation,

      selectedVariationStocks: stocks,
    };
  }, [product, selectedVariations]);

  /* ---------------------------------------------------------------------- */
  /* QUANTITY SYNC                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    setQuantity((current) => {
      if (availableStock <= 0) {
        return 1;
      }

      return Math.min(Math.max(Number(current) || 1, 1), availableStock);
    });
  }, [availableStock]);

  /* ---------------------------------------------------------------------- */
  /* PRODUCT STATE                                                           */
  /* ---------------------------------------------------------------------- */

  const isMainOutOfStock = product?.status !== "Active" || baseStock <= 0;

  const variationsIncomplete = hasVariations && !allSelected;

  const isOutOfStock =
    product?.status !== "Active" ||
    baseStock <= 0 ||
    (allSelected && availableStock <= 0);

  const cannotPurchase =
    isOutOfStock || variationsIncomplete || !productValidation.valid;

  /* ---------------------------------------------------------------------- */
  /* VARIATION CHANGE                                                       */
  /* ---------------------------------------------------------------------- */

  const handleVariationChange = (option, value) => {
    const variation = getVariationOptions(product).find(
      (item) => item?.option === option
    );

    if (!variation) {
      return;
    }

    const valueExists =
      Array.isArray(variation.values) &&
      variation.values.some((item) => item?.value === value);

    if (!valueExists) {
      toast.error("Invalid variation selection.");

      return;
    }

    const selectedValue = variation.values.find(
      (item) => item?.value === value
    );

    if (Number(selectedValue?.stock || 0) <= 0) {
      toast.error(`${option} "${value}" is currently out of stock.`);

      return;
    }

    setSelectedVariations((previous) => ({
      ...previous,
      [option]: value,
    }));

    setQuantity(1);
    setValidationErrors([]);
  };

  /* ---------------------------------------------------------------------- */
  /* QUANTITY                                                                */
  /* ---------------------------------------------------------------------- */

  const decreaseQuantity = () => {
    if (cannotPurchase) {
      return;
    }

    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    if (cannotPurchase) {
      return;
    }

    setQuantity((current) => Math.min(availableStock, current + 1));
  };

  /* ---------------------------------------------------------------------- */
  /* ADD TO CART                                                            */
  /* ---------------------------------------------------------------------- */

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    /* Full schema validation */
    const productCheck = validateProduct(product);

    if (!productCheck.valid) {
      setValidationErrors(productCheck.errors);

      toast.error(
        "This product contains invalid data and cannot be added to cart."
      );

      console.error("Product validation failed:", productCheck.errors);

      return;
    }

    /* Status validation */
    if (product.status !== "Active") {
      toast.error(
        product.status === "Inactive"
          ? "This product is currently unavailable."
          : "This product is currently out of stock."
      );

      return;
    }

    /* Base stock validation */
    const currentBaseStock = getBaseStock(product);

    if (currentBaseStock <= 0) {
      toast.error("This product is currently out of stock.");

      return;
    }

    /* Variation validation */
    const variationErrors = validateSelectedVariations(
      product,
      selectedVariations
    );

    if (variationErrors.length > 0) {
      setValidationErrors(variationErrors);

      toast.error(variationErrors[0]);

      return;
    }

    /* Recalculate stock immediately before adding */
    const currentAllowedStock = calculateEffectiveStock(
      product,
      selectedVariations
    );

    if (currentAllowedStock <= 0) {
      toast.error("The selected configuration is currently out of stock.");

      return;
    }

    /* Quantity validation */
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      toast.error("Please select a valid quantity.");

      return;
    }

    if (requestedQuantity > currentAllowedStock) {
      toast.warning(
        `Only ${currentAllowedStock} item${
          currentAllowedStock === 1 ? "" : "s"
        } available for this configuration.`
      );

      setQuantity(currentAllowedStock);

      return;
    }

    /*
     * Important:
     *
     * Price comes ONLY from product.price because
     * the Mongoose schema does not define variation prices.
     */
    const cartItem = {
      productId: product.productId,

      name: product.name,

      slug: product.slug,

      price: finalPrice,

      quantity: requestedQuantity,

      image: images[0]?.url || FALLBACK_IMAGE,

      variations: {
        ...selectedVariations,
      },

      stock: currentAllowedStock,
    };

    dispatch(addToCart(cartItem));

    toast.success(`${product.name} added to cart successfully!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  /* ---------------------------------------------------------------------- */
  /* INVALID PRODUCT UI                                                     */
  /* ---------------------------------------------------------------------- */

  if (!product) {
    return null;
  }

  if (!productValidation.valid) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-3xl border border-red-900/50 bg-neutral-900 p-8">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="w-6 h-6 text-red-400" />

            <h1 className="text-xl font-bold">Product data unavailable</h1>
          </div>

          <p className="text-sm text-neutral-400 mb-5">
            This product contains invalid information and cannot be displayed
            for purchase.
          </p>

          <ul className="space-y-2">
            {productValidation.errors.map((error, index) => (
              <li key={index} className="text-xs text-red-300">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  const currentImage = images[selectedImageIndex]?.url || FALLBACK_IMAGE;

  const currentImageAlt = images[selectedImageIndex]?.alt || product.name;

  const savings =
    product.comparePrice !== undefined &&
    product.comparePrice !== null &&
    Number(product.comparePrice) > finalPrice
      ? Number(product.comparePrice) - finalPrice
      : 0;

  const discountPercentage =
    savings > 0 && Number(product.comparePrice) > 0
      ? Math.round((savings / Number(product.comparePrice)) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 pb-28 lg:pb-16">
      {/* ------------------------------------------------------------------ */}
      {/* HERO PRODUCT                                                        */}
      {/* ------------------------------------------------------------------ */}

      <article className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          {/* IMAGE GALLERY */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl"> <Image key={`${currentImage}-${selectedImageIndex}`} src={currentImage} alt={currentImageAlt} fill priority quality={100} sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain p-2 transition-transform duration-500 hover:scale-[1.02]" /> {isOutOfStock && ( <div className="absolute top-5 left-5 z-10 px-4 py-2 rounded-full bg-neutral-950/90 backdrop-blur border border-red-900/50 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400"> {product.status !== "Active" ? "Unavailable" : "Out of Stock"} </div> )} {discountPercentage > 0 && !isOutOfStock && ( <div className="absolute top-5 right-5 z-10 px-4 py-2 rounded-full bg-white text-neutral-950 text-[10px] font-black uppercase tracking-widest"> -{discountPercentage}% </div> )} </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <nav
                aria-label="Image gallery thumbnails"
                className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    aria-label={`View ${image.alt}`}
                    aria-current={selectedImageIndex === index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-xl border transition-all ${
                      selectedImageIndex === index
                        ? "border-white opacity-100 ring-1 ring-white"
                        : "border-neutral-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <section className="flex flex-col justify-center">
            {/* CATEGORY / BRAND */}
            <header className="flex flex-wrap gap-2 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
                <Watch className="w-3.5 h-3.5 text-neutral-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Rebel Watches
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800">
                <Tag className="w-3.5 h-3.5 text-neutral-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  {product.productId}
                </span>
              </div>
            </header>

            {/* NAME */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-[32px] font-normal tracking-tight text-white leading-[1.15] mb-5 max-w-2xl"> {product.name} </h1>

            {/* DESCRIPTION */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-xl mb-7">
              {product.description}
            </p>

            {/* PRODUCT META */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              <Link
                href={`/collections/${slugify(
                  product.category.toLowerCase()
                )}-articles`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-neutral-600 transition-colors"
              >
                <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2">
                  Category
                </span>

                <span className="block text-xs font-semibold text-neutral-300">
                  {product.category}
                </span>
              </Link>

              <Link
                href={`/collections/${slugify(
                  product.gender.toLowerCase()
                )}-articles`}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 hover:border-neutral-600 transition-colors"
              >
                <span className="block text-[9px] uppercase tracking-widest text-neutral-600 mb-2">
                  Gender
                </span>

                <span className="block text-xs font-semibold text-neutral-300">
                  {product.gender}
                </span>
              </Link>
            </div>

            {/* PRICE */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-neutral-600 mb-1">
                  Price
                </span>

                <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Rs. {formatPrice(finalPrice)}
                </div>
              </div>

              {savings > 0 && (
                <div className="pb-1">
                  <span className="block text-lg text-neutral-600 line-through">
                    Rs. {formatPrice(product.comparePrice)}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    Save Rs. {formatPrice(savings)}
                  </span>
                </div>
              )}
            </div>

            {/* STOCK */}
            <div className="rounded-2xl border border-neutral-900 bg-neutral-900/40 p-4 mb-8">
              <StockIndicator
                stock={allSelected ? availableStock : baseStock}
                status={product.status}
              />

              {hasVariations && !allSelected && !isMainOutOfStock && (
                <p className="text-[10px] text-neutral-600 mt-3">
                  Select all available options to see the exact stock for your
                  configuration.
                </p>
              )}

              {allSelected && selectedVariationStocks.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedVariationStocks.map((item) => (
                    <span
                      key={`${item.option}-${item.value}`}
                      className="px-3 py-1.5 rounded-full bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400"
                    >
                      {item.option}:{" "}
                      <strong className="text-neutral-200">{item.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* VARIATIONS */}
            {!isMainOutOfStock &&
              hasVariations &&
              product.variations.map((variation) => (
                <fieldset
                  key={variation.option}
                  className="mb-7 border-0 p-0 m-0"
                >
                  <legend className="w-full">
                    <div className="flex items-center justify-between mb-3 w-full">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                        {variation.option}
                      </span>

                      {selectedVariations[variation.option] && (
                        <span className="text-[10px] text-white font-medium">
                          {selectedVariations[variation.option]}
                        </span>
                      )}
                    </div>
                  </legend>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(variation.values) &&
                      variation.values.map((value, index) => {
                        const optionStock = Number(value?.stock || 0);

                        const disabled = optionStock <= 0;

                        const selected =
                          selectedVariations[variation.option] === value.value;

                        return (
                          <button
                            key={`${value.value}-${index}`}
                            type="button"
                            disabled={disabled}
                            aria-pressed={selected}
                            onClick={() =>
                              handleVariationChange(
                                variation.option,
                                value.value
                              )
                            }
                            className={`group relative px-5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                              selected
                                ? "bg-white text-neutral-950 border-white shadow-lg"
                                : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600"
                            } ${
                              disabled
                                ? "opacity-25 cursor-not-allowed line-through"
                                : ""
                            }`}
                          >
                            {value.value}

                            {!disabled && (
                              <span
                                className={`block mt-1 text-[8px] font-normal ${
                                  selected
                                    ? "text-neutral-500"
                                    : optionStock <= 3
                                    ? "text-red-400"
                                    : "text-neutral-600"
                                }`}
                              >
                                {optionStock <= 0
                                  ? "Sold out"
                                  : optionStock <= 3
                                  ? `Low Stock`
                                  : `Available`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </fieldset>
              ))}

            {/* SELECTION WARNING */}
            {variationsIncomplete && !isMainOutOfStock && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />

                <div>
                  <p className="text-xs font-bold text-amber-300">
                    Select your options
                  </p>

                  <p className="text-[10px] text-amber-500/70 mt-1">
                    Please select every available product option before adding
                    this item to your cart.
                  </p>
                </div>
              </div>
            )}

            {/* DESKTOP PURCHASE */}
            <div className="hidden lg:flex gap-3 mb-10">
              <div className="flex items-center border border-neutral-800 bg-neutral-900 rounded-xl">
                <button
                  type="button"
                  disabled={cannotPurchase}
                  onClick={decreaseQuantity}
                  className="w-12 h-12 flex items-center justify-center hover:text-white text-neutral-500 disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center text-sm font-bold text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  disabled={cannotPurchase || quantity >= availableStock}
                  onClick={increaseQuantity}
                  className="w-12 h-12 flex items-center justify-center hover:text-white text-neutral-500 disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={cannotPurchase}
                className="flex-1 flex items-center justify-center gap-3 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 py-4 px-8 text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />

                {product.status !== "Active"
                  ? "Unavailable"
                  : baseStock <= 0
                  ? "Out of Stock"
                  : variationsIncomplete
                  ? "Select Options"
                  : availableStock <= 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>
            </div>

            {/* PRODUCT INFORMATION CARDS */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <Layers3 className="w-5 h-5 text-neutral-300 mb-3" />

                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                  Variations
                </h3>

                <p className="text-[10px] text-neutral-600">
                  {hasVariations
                    ? `${product.variations.length} ${
                        product.variations.length === 1 ? "option" : "options"
                      } available`
                    : "No variations"}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <CircleDollarSign className="w-5 h-5 text-neutral-300 mb-3" />

                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                  Pricing
                </h3>

                <p className="text-[10px] text-neutral-600">
                  {savings > 0
                    ? `${discountPercentage}% special offer`
                    : "Current price"}
                </p>
              </div>
            </div>

            {/* TRUST */}
            <aside
              aria-label="Trust assurances"
              className="grid grid-cols-3 gap-4 border-t border-neutral-900 pt-8"
            >
              <div>
                <ShieldCheck className="w-5 h-5 text-neutral-300 mb-3" />

                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                  Certified
                </h2>

                <p className="text-[10px] text-neutral-600">
                  Authentic timepiece
                </p>
              </div>

              <div>
                <Truck className="w-5 h-5 text-neutral-300 mb-3" />

                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                  Delivery
                </h2>

                <p className="text-[10px] text-neutral-600">Secure shipping</p>
              </div>

              <div>
                <PackageCheck className="w-5 h-5 text-neutral-300 mb-3" />

                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                  Protected
                </h2>

                <p className="text-[10px] text-neutral-600">
                  Carefully inspected
                </p>
              </div>
            </aside>
          </section>
        </div>
      </article>

      {/* ------------------------------------------------------------------ */}
      {/* DETAILED DESCRIPTION                                               */}
      {/* ------------------------------------------------------------------ */}

      {product.detailedDescription && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 border-t border-neutral-900">
          <div className="max-w-4xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">
              Specifications
            </span>

            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-3 mb-8">
              The Story Behind The Timepiece
            </h2>

            <div className="text-neutral-400 leading-8 text-sm sm:text-base border-l border-neutral-700 pl-6 md:pl-8">
              <ProductDescription content={product.detailedDescription} />
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE CART                                                        */}
      {/* ------------------------------------------------------------------ */}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              type="button"
              disabled={cannotPurchase}
              onClick={decreaseQuantity}
              className="w-10 h-11 flex items-center justify-center text-neutral-400 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-xs font-bold text-white">
              {quantity}
            </span>

            <button
              type="button"
              disabled={cannotPurchase || quantity >= availableStock}
              onClick={increaseQuantity}
              className="w-10 h-11 flex items-center justify-center text-neutral-400 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cannotPurchase}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-neutral-950 disabled:bg-neutral-800 disabled:text-neutral-500 text-[10px] font-bold uppercase tracking-widest"
          >
            <ShoppingCart className="w-3.5 h-3.5" />

            {product.status !== "Active"
              ? "Unavailable"
              : baseStock <= 0
              ? "Out of Stock"
              : variationsIncomplete
              ? "Select Options"
              : availableStock <= 0
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
        </div>
      </div>
    </main>
  );
}
