import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Shipping from "../models/Shipping.js";
import transporter from "../config/mailer.js";
import { revalidateProductInBackground } from "../lib/revalidateFunc.js";

const COD_FEE = 100;

/* =========================================================
   HELPERS
========================================================= */

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const normalizeVariations = (variations) => {
  if (!variations || typeof variations !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(variations)
      .filter(
        ([option, value]) =>
          option &&
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      )
      .map(([option, value]) => [String(option).trim(), String(value).trim()])
  );
};

/* =========================================================
   PURCHASE EMAIL
========================================================= */

const sendPurchaseEmail = async ({ order, buyerName, buyerEmail }) => {
  if (!buyerEmail) {
    console.warn("Purchase email skipped: buyer email not found");
    return;
  }

  const safeBuyerName = escapeHtml(buyerName || "valued customer");

  const safeOrderNumber = escapeHtml(order.orderNumber);

  const itemsHtml = order.items
    .map((item) => {
      const variations = normalizeVariations(item.variations);

      const variationHtml =
        Object.keys(variations).length > 0
          ? `
            <div style="margin-top: 8px;">
              ${Object.entries(variations)
                .map(
                  ([option, value]) => `
                    <span style="
                      display: inline-block;
                      background-color: #222222;
                      border: 1px solid #333333;
                      border-radius: 6px;
                      padding: 4px 8px;
                      margin: 2px 4px 2px 0;
                      font-size: 10px;
                      color: #a3a3a3;
                    ">
                      ${escapeHtml(option)}: ${escapeHtml(value)}
                    </span>
                  `
                )
                .join("")}
            </div>
          `
          : "";

      const itemTotal = Number(item.price) * Number(item.quantity);

      const safeName = escapeHtml(item.name);
      const safeImage = item.image ? escapeHtml(item.image) : "";

      return `
        <div style="
          padding: 20px 0;
          border-bottom: 1px solid #262626;
        ">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>

              <!-- Product Image -->
              <td width="72" valign="top">
                ${
                  safeImage
                    ? `
                      <img
                        src="${safeImage}"
                        alt="${safeName}"
                        width="64"
                        height="64"
                        style="
                          width: 64px;
                          height: 64px;
                          object-fit: cover;
                          border-radius: 10px;
                          border: 1px solid #333333;
                          display: block;
                        "
                      />
                    `
                    : `
                      <div style="
                        width: 64px;
                        height: 64px;
                        background-color: #222222;
                        border-radius: 10px;
                        border: 1px solid #333333;
                      "></div>
                    `
                }
              </td>

              <!-- Product Details -->
              <td
                valign="top"
                style="padding-left: 14px;"
              >
                <div style="
                  color: #ffffff;
                  font-size: 14px;
                  font-weight: 600;
                  line-height: 1.4;
                ">
                  ${safeName}
                </div>

                ${variationHtml}

                <div style="
                  color: #737373;
                  font-size: 12px;
                  margin-top: 8px;
                ">
                  Quantity: ${escapeHtml(item.quantity)}
                </div>
              </td>

              <!-- Item Price -->
              <td
                valign="top"
                align="right"
                style="
                  color: #ffffff;
                  font-size: 14px;
                  font-weight: 600;
                  white-space: nowrap;
                "
              >
                Rs. ${itemTotal.toLocaleString()}
              </td>

            </tr>
          </table>
        </div>
      `;
    })
    .join("");

  const shippingAddress = order.shippingAddress;

  const safeFullName = escapeHtml(shippingAddress.fullName);

  const safeAddress = escapeHtml(shippingAddress.address);

  const safeCity = escapeHtml(shippingAddress.city);

  const safePostalCode = escapeHtml(shippingAddress.postalCode);

  const safePhone = escapeHtml(shippingAddress.phone);

  const safePaymentMethod =
    order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment";

  const safeOrderStatus = escapeHtml(order.orderStatus);

  await transporter.sendMail({
    from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `Order Confirmed ${order.orderNumber}`,

    html: `
      <div style="
        background-color: #080808;
        width: 100%;
        padding: 30px 0;
        font-family:
          'Plus Jakarta Sans',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
        color: #e5e5e5;
      ">

        <div style="
          background-color: #121212;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          border-radius: 24px;
          border: 1px solid #262626;
          overflow: hidden;
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.8);
        ">

          <!-- HEADER -->
          <div style="
            padding: 32px 40px 24px;
            text-align: center;
            border-bottom: 1px solid #222222;
          ">

            <div style="
              font-family: Georgia, serif;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.25em;
              color: #ffffff;
              text-transform: uppercase;
            ">
              Rebel Watches
            </div>

            <div style="
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #737373;
              margin-top: 6px;
            ">
              Curated Luxury Timepieces
            </div>

          </div>

          <!-- BODY -->
          <div style="padding: 40px;">

            <!-- SUCCESS -->
            <div style="
              text-align: center;
              margin-bottom: 32px;
            ">

              <div style="
                width: 56px;
                height: 56px;
                line-height: 56px;
                margin: 0 auto 18px;
                border-radius: 50%;
                background-color: #1f1f1f;
                border: 1px solid #333333;
                color: #ffffff;
                font-size: 24px;
              ">
                ✓
              </div>

              <h1 style="
                font-family: Georgia, serif;
                font-size: 28px;
                font-weight: 600;
                color: #ffffff;
                margin: 0 0 10px;
              ">
                Order Confirmed
              </h1>

              <p style="
                font-size: 14px;
                color: #a3a3a3;
                line-height: 1.6;
                margin: 0;
              ">
                Thank you for your purchase,
                ${safeBuyerName}.
                Your order has been successfully placed.
              </p>

            </div>

            <!-- ORDER NUMBER -->
            <div style="
              background-color: #171717;
              border: 1px solid #262626;
              border-radius: 14px;
              padding: 18px 20px;
              margin-bottom: 28px;
            ">

              <div style="
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: #737373;
                margin-bottom: 6px;
              ">
                Order Number
              </div>

              <div style="
                font-family: monospace;
                font-size: 15px;
                color: #ffffff;
                word-break: break-all;
              ">
                #${safeOrderNumber}
              </div>

              <div style="
                font-size: 11px;
                color: #666666;
                margin-top: 7px;
              ">
                Payment: ${safePaymentMethod}
              </div>

            </div>

            <!-- ITEMS -->
            <div>

              <div style="
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: #737373;
                margin-bottom: 4px;
              ">
                Your Purchase
              </div>

              ${itemsHtml}

            </div>

            <!-- TOTALS -->
            <div style="
              margin-top: 24px;
              padding-top: 20px;
              border-top: 1px solid #333333;
            ">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="font-size: 13px;"
              >

                <!-- SUBTOTAL -->
                <tr>

                  <td style="
                    padding: 6px 0;
                    color: #737373;
                  ">
                    Subtotal
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 6px 0;
                      color: #d4d4d4;
                    "
                  >
                    Rs.
                    ${Number(order.subtotal).toLocaleString()}
                  </td>

                </tr>

                <!-- SHIPPING -->
                <tr>

                  <td style="
                    padding: 6px 0;
                    color: #737373;
                  ">
                    Shipping
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 6px 0;
                      color: #d4d4d4;
                    "
                  >
                    ${
                      Number(order.shippingFee) === 0
                        ? "FREE"
                        : `Rs. ${Number(order.shippingFee).toLocaleString()}`
                    }
                  </td>

                </tr>

                <!-- COD FEE -->
                ${
                  Number(order.codFee) > 0
                    ? `
                      <tr>

                        <td style="
                          padding: 6px 0;
                          color: #737373;
                        ">
                          Cash on Delivery Fee
                        </td>

                        <td
                          align="right"
                          style="
                            padding: 6px 0;
                            color: #d4d4d4;
                          "
                        >
                          Rs.
                          ${Number(order.codFee).toLocaleString()}
                        </td>

                      </tr>
                    `
                    : ""
                }

                <!-- DIVIDER -->
                <tr>

                  <td colspan="2">

                    <div style="
                      height: 1px;
                      background-color: #333333;
                      margin: 12px 0;
                    "></div>

                  </td>

                </tr>

                <!-- TOTAL -->
                <tr>

                  <td style="
                    padding: 8px 0;
                    color: #ffffff;
                    font-size: 15px;
                    font-weight: 700;
                  ">
                    Total
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 8px 0;
                      color: #ffffff;
                      font-size: 18px;
                      font-weight: 700;
                    "
                  >
                    Rs.
                    ${Number(order.total).toLocaleString()}
                  </td>

                </tr>

              </table>

            </div>

            <!-- SHIPPING ADDRESS -->
            <div style="
              background-color: #171717;
              border: 1px solid #262626;
              border-radius: 14px;
              padding: 20px;
              margin-top: 28px;
            ">

              <div style="
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: #737373;
                margin-bottom: 12px;
              ">
                Delivery Address
              </div>

              <div style="
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 6px;
              ">
                ${safeFullName}
              </div>

              <div style="
                color: #a3a3a3;
                font-size: 13px;
                line-height: 1.6;
              ">
                ${safeAddress}<br>

                ${safeCity}${
      shippingAddress.postalCode ? `, ${safePostalCode}` : ""
    }<br>

                ${safePhone}
              </div>

            </div>

            <!-- STATUS -->
            <div style="
              margin-top: 28px;
              text-align: center;
            ">

              <div style="
                display: inline-block;
                background-color: #1f1f1f;
                border: 1px solid #333333;
                border-radius: 999px;
                padding: 8px 16px;
                color: #d4d4d4;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.15em;
              ">
                Order Status:
                ${safeOrderStatus}
              </div>
              <a href="${process.env.client_url}/track?orderId=${
      order.orderNumber
    }" style="
    display: inline-block;
    background-color: #1f1f1f;
    border: 1px solid #333333;
    border-radius: 999px;
    padding: 8px 16px;
    color: #d4d4d4;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    text-decoration: none;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
" onmouseover="this.style.backgroundColor='#2a2a2a'; this.style.borderColor='#555555'; this.style.color='#ffffff';" onmouseout="this.style.backgroundColor='#1f1f1f'; this.style.borderColor='#333333'; this.style.color='#d4d4d4';">
    Track your Order
</a>

            </div>

            <p style="
              margin: 28px 0 0;
              font-size: 13px;
              line-height: 1.6;
              color: #737373;
              text-align: center;
            ">
              We'll keep you updated as your order moves
              through packaging, shipping, and delivery.
            </p>

          </div>

          <!-- FOOTER -->
          <div style="
            padding: 24px 40px;
            background-color: #0f0f0f;
            border-top: 1px solid #1f1f1f;
            text-align: center;
          ">

            <p style="
              font-size: 11px;
              color: #525252;
              margin: 0;
              letter-spacing: 0.05em;
            ">
              &copy; ${new Date().getFullYear()}
              Rebel Watches.
              All rights reserved.
            </p>

            <p style="
              font-size: 11px;
              color: #525252;
              margin: 6px 0 0;
              letter-spacing: 0.05em;
            ">
              Precision engineered for those who rule
              their own time.
            </p>

          </div>

        </div>

      </div>
    `,
  });
};

/* =========================================================
   DELIVERY EMAIL
========================================================= */

const sendDeliveryEmail = async ({ order, buyerName, buyerEmail }) => {
  if (!buyerEmail) {
    console.warn("Delivery email skipped: buyer email not found");
    return;
  }

  const safeBuyerName = escapeHtml(buyerName || "valued customer");
  const safeOrderNumber = escapeHtml(order.orderNumber);

  const clientUrl = String(process.env.CLIENT_URL || "").replace(/\/$/, "");

  await transporter.sendMail({
    from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `Your Order Has Been Delivered — ${order.orderNumber}`,

    html: `
      <div style="
        background-color: #080808;
        width: 100%;
        padding: 30px 0;
        font-family:
          'Plus Jakarta Sans',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
        color: #e5e5e5;
      ">

        <div style="
          background-color: #121212;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          border-radius: 24px;
          border: 1px solid #262626;
          overflow: hidden;
        ">

          <!-- HEADER -->
          <div style="
            padding: 32px 40px 24px;
            text-align: center;
            border-bottom: 1px solid #222222;
          ">
            <div style="
              font-family: Georgia, serif;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.25em;
              color: #ffffff;
              text-transform: uppercase;
            ">
              Rebel Watches
            </div>

            <div style="
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #737373;
              margin-top: 6px;
            ">
              Curated Luxury Timepieces
            </div>
          </div>

          <!-- BODY -->
          <div style="padding: 40px;">

            <div style="
              text-align: center;
              margin-bottom: 32px;
            ">

              <div style="
                width: 56px;
                height: 56px;
                line-height: 56px;
                margin: 0 auto 18px;
                border-radius: 50%;
                background-color: #1f1f1f;
                border: 1px solid #333333;
                color: #ffffff;
                font-size: 24px;
              ">
                ✓
              </div>

              <h1 style="
                font-family: Georgia, serif;
                font-size: 28px;
                font-weight: 600;
                color: #ffffff;
                margin: 0 0 10px;
              ">
                Order Delivered
              </h1>

              <p style="
                font-size: 14px;
                color: #a3a3a3;
                line-height: 1.7;
                margin: 0;
              ">
                Hi ${safeBuyerName},
              </p>

              <p style="
                font-size: 14px;
                color: #a3a3a3;
                line-height: 1.7;
                margin: 8px 0 0;
              ">
                Your Rebel Watches order has been successfully
                delivered. We hope you love your new timepiece.
              </p>

            </div>

            <!-- ORDER -->
            <div style="
              background-color: #171717;
              border: 1px solid #262626;
              border-radius: 14px;
              padding: 18px 20px;
            ">

              <div style="
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: #737373;
                margin-bottom: 6px;
              ">
                Order Number
              </div>

              <div style="
                font-family: monospace;
                font-size: 15px;
                color: #ffffff;
                word-break: break-all;
              ">
                #${safeOrderNumber}
              </div>

              <div style="
                font-size: 11px;
                color: #666666;
                margin-top: 7px;
              ">
                Status: Delivered
              </div>

            </div>

            <div style="
              text-align: center;
              margin-top: 30px;
            ">

              <p style="
                font-family: Georgia, serif;
                font-size: 20px;
                line-height: 1.5;
                color: #ffffff;
                margin: 0 0 12px;
              ">
                Thank you for choosing Rebel Watches.
              </p>

              <p style="
                font-size: 13px;
                line-height: 1.7;
                color: #737373;
                margin: 0;
              ">
                We appreciate your trust and hope to see you
                again soon.
              </p>

            </div>

            <!-- SHOP BUTTON -->
            <div style="
              text-align: center;
              margin-top: 30px;
            ">

              <a
                href="${escapeHtml(clientUrl)}"
                style="
                  display: inline-block;
                  background-color: #ffffff;
                  color: #080808;
                  text-decoration: none;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  padding: 14px 26px;
                  border-radius: 8px;
                "
              >
                Explore More Timepieces
              </a>

            </div>

          </div>

          <!-- FOOTER -->
          <div style="
            padding: 24px 40px;
            background-color: #0f0f0f;
            border-top: 1px solid #1f1f1f;
            text-align: center;
          ">

            <p style="
              font-size: 11px;
              color: #525252;
              margin: 0;
            ">
              &copy; ${new Date().getFullYear()}
              Rebel Watches. All rights reserved.
            </p>

          </div>

        </div>
      </div>
    `,
  });
};

/* =========================================================
   ORDER CANCELLED EMAIL
========================================================= */

const sendOrderCancelledEmail = async ({ order, buyerName, buyerEmail }) => {
  if (!buyerEmail) {
    console.warn("Cancellation email skipped: buyer email not found");
    return;
  }

  const safeBuyerName = escapeHtml(buyerName || "valued customer");
  const safeOrderNumber = escapeHtml(order.orderNumber);

  const clientUrl = String(process.env.CLIENT_URL || "").replace(/\/$/, "");

  await transporter.sendMail({
    from: `"Rebel Watches" <${process.env.EMAIL_USER}>`,
    to: buyerEmail,
    subject: `Order Cancelled — ${order.orderNumber}`,

    html: `
      <div style="
        background-color: #080808;
        width: 100%;
        padding: 30px 0;
        font-family:
          'Plus Jakarta Sans',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          Helvetica,
          Arial,
          sans-serif;
        color: #e5e5e5;
      ">

        <div style="
          background-color: #121212;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          border-radius: 24px;
          border: 1px solid #262626;
          overflow: hidden;
        ">

          <!-- HEADER -->
          <div style="
            padding: 32px 40px 24px;
            text-align: center;
            border-bottom: 1px solid #222222;
          ">

            <div style="
              font-family: Georgia, serif;
              font-size: 24px;
              font-weight: 700;
              letter-spacing: 0.25em;
              color: #ffffff;
              text-transform: uppercase;
            ">
              Rebel Watches
            </div>

            <div style="
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3em;
              color: #737373;
              margin-top: 6px;
            ">
              Curated Luxury Timepieces
            </div>

          </div>

          <!-- BODY -->
          <div style="padding: 40px;">

            <div style="
              text-align: center;
              margin-bottom: 32px;
            ">

              <div style="
                width: 56px;
                height: 56px;
                line-height: 56px;
                margin: 0 auto 18px;
                border-radius: 50%;
                background-color: #1f1f1f;
                border: 1px solid #333333;
                color: #ffffff;
                font-size: 22px;
              ">
                ×
              </div>

              <h1 style="
                font-family: Georgia, serif;
                font-size: 28px;
                font-weight: 600;
                color: #ffffff;
                margin: 0 0 10px;
              ">
                Order Cancelled
              </h1>

              <p style="
                font-size: 14px;
                color: #a3a3a3;
                line-height: 1.7;
                margin: 0;
              ">
                Hi ${safeBuyerName},
              </p>

              <p style="
                font-size: 14px;
                color: #a3a3a3;
                line-height: 1.7;
                margin: 8px 0 0;
              ">
                Your order has been cancelled successfully.
                Any applicable stock has been restored.
              </p>

            </div>

            <!-- ORDER -->
            <div style="
              background-color: #171717;
              border: 1px solid #262626;
              border-radius: 14px;
              padding: 18px 20px;
            ">

              <div style="
                font-size: 9px;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: #737373;
                margin-bottom: 6px;
              ">
                Order Number
              </div>

              <div style="
                font-family: monospace;
                font-size: 15px;
                color: #ffffff;
                word-break: break-all;
              ">
                #${safeOrderNumber}
              </div>

              <div style="
                font-size: 11px;
                color: #666666;
                margin-top: 7px;
              ">
                Status: Cancelled
              </div>

            </div>

            <div style="
              text-align: center;
              margin-top: 30px;
            ">

              <p style="
                font-size: 13px;
                line-height: 1.7;
                color: #737373;
                margin: 0;
              ">
                We're sorry this order didn't work out.
                Whenever you're ready, we'd love to have
                you shop with us again.
              </p>

            </div>

            <!-- SHOP BUTTON -->
            <div style="
              text-align: center;
              margin-top: 30px;
            ">

              <a
                href="${escapeHtml(clientUrl)}"
                style="
                  display: inline-block;
                  background-color: #ffffff;
                  color: #080808;
                  text-decoration: none;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  padding: 14px 26px;
                  border-radius: 8px;
                "
              >
                Continue Shopping
              </a>

            </div>

          </div>

          <!-- FOOTER -->
          <div style="
            padding: 24px 40px;
            background-color: #0f0f0f;
            border-top: 1px solid #1f1f1f;
            text-align: center;
          ">

            <p style="
              font-size: 11px;
              color: #525252;
              margin: 0;
            ">
              &copy; ${new Date().getFullYear()}
              Rebel Watches. All rights reserved.
            </p>

          </div>

        </div>
      </div>
    `,
  });
};

/* =========================================================
   VARIATION STOCK
========================================================= */

const getVariationStockPaths = (product, variations, quantity) => {
  const normalized = normalizeVariations(variations);

  const operations = [];

  for (const [option, value] of Object.entries(normalized)) {
    const variation = product.variations?.find(
      (item) =>
        String(item.option).trim().toLowerCase() === option.trim().toLowerCase()
    );

    if (!variation) {
      throw new Error(
        `Variation option "${option}" is not available for ${product.name}`
      );
    }

    const variationValue = variation.values?.find(
      (item) =>
        String(item.value).trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (!variationValue) {
      throw new Error(
        `Variation "${option}: ${value}" is not available for ${product.name}`
      );
    }

    operations.push({
      option: variation.option,
      value: variationValue.value,
      quantity,
    });
  }

  return operations;
};

/* =========================================================
   STOCK VALIDATION
========================================================= */

const validateProductStock = (product, item) => {
  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity for product ${product.name}`);
  }

  const variations = normalizeVariations(item.variations);

  const variationEntries = Object.entries(variations);

  if (product.variations?.length > 0 && variationEntries.length === 0) {
    throw new Error(
      `Please select all required variations for ${product.name}`
    );
  }

  if (
    product.variations?.length > 0 &&
    variationEntries.length !== product.variations.length
  ) {
    throw new Error(
      `Please select all required variations for ${product.name}`
    );
  }

  if (product.variations?.length > 0) {
    const variationOperations = getVariationStockPaths(
      product,
      variations,
      quantity
    );

    return {
      type: "variation",
      variationOperations,
    };
  }

  if (Number(product.stock || 0) < quantity) {
    throw new Error(`${product.name} does not have enough stock`);
  }

  return {
    type: "normal",
    quantity,
  };
};

/* =========================================================
   BUILD ORDER DATA
========================================================= */

const buildOrderData = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const productIds = [
    ...new Set(items.map((item) => String(item.product || "").trim())),
  ];

  if (productIds.some((id) => !id)) {
    throw new Error("Invalid product information");
  }

  const products = await Product.find({
    productId: {
      $in: productIds,
    },
  }).lean();

  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((product) => product.productId));

    const missingId = productIds.find((id) => !foundIds.has(id));

    throw new Error(`Product ${missingId || ""} was not found`);
  }

  const productMap = new Map(
    products.map((product) => [product.productId, product])
  );

  const stockOperations = [];
  const orderItems = [];
  const affectedProductIds = new Set();
  const affectedProductSlugs = new Set();

  for (const item of items) {
    const productId = String(item.product || "").trim();

    const product = productMap.get(productId);

    if (!product) {
      throw new Error(`Product ${productId} was not found`);
    }

    if (product.status === "Inactive") {
      throw new Error(`${product.name} is currently unavailable`);
    }

    const quantity = Number(item.quantity);

    const stockInfo = validateProductStock(product, item);

    const variations = normalizeVariations(item.variations);

    const price = Number(product.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(`Invalid price for ${product.name}`);
    }

    if (stockInfo.type === "normal") {
      stockOperations.push({
        productId: product._id,
        productCustomId: product.productId,
        type: "normal",
        quantity,
      });
    } else {
      // Decrease MAIN product stock once per order item
      stockOperations.push({
        productId: product._id,
        productCustomId: product.productId,
        type: "main",
        quantity,
      });

      // Decrease each selected variation stock
      for (const variationOperation of stockInfo.variationOperations) {
        stockOperations.push({
          productId: product._id,
          productCustomId: product.productId,
          type: "variation",
          option: variationOperation.option,
          value: variationOperation.value,
          quantity,
        });
      }
    }

    affectedProductIds.add(product._id.toString());

    if (product.slug) {
      affectedProductSlugs.add(product.slug);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price,
      quantity,
      variations,
      image: product.images?.[0]?.url || null,
    });
  }

  return {
    orderItems,
    stockOperations,
    affectedProductIds: [...affectedProductIds],
    affectedProductSlugs: [...affectedProductSlugs],
  };
};

/* =========================================================
   APPLY STOCK
   IMPORTANT:
   This function owns rollback for partial stock updates.
========================================================= */

const applyStockUpdates = async (stockOperations) => {
  const appliedOperations = [];

  try {
    for (const operation of stockOperations) {
      let updatedProduct;

      /* -------------------------
         NORMAL PRODUCT
      ------------------------- */

      if (operation.type === "normal" || operation.type === "main") {
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: operation.productId,

            stock: {
              $gte: operation.quantity,
            },
          },
          {
            $inc: {
              stock: -operation.quantity,

              salesCount: operation.quantity,
            },
          },
          {
            returnDocument: "after",
          }
        );
      } else {
        /* -------------------------
         VARIATION PRODUCT
      ------------------------- */
        updatedProduct = await Product.findOneAndUpdate(
          {
            _id: operation.productId,

            variations: {
              $elemMatch: {
                option: operation.option,

                values: {
                  $elemMatch: {
                    value: operation.value,

                    stock: {
                      $gte: operation.quantity,
                    },
                  },
                },
              },
            },
          },
          {
            $inc: {
              "variations.$[variation].values.$[value].stock":
                -operation.quantity,
            },
          },
          {
            arrayFilters: [
              {
                "variation.option": operation.option,
              },
              {
                "value.value": operation.value,
              },
            ],

            returnDocument: "after",
          }
        );
      }

      if (!updatedProduct) {
        throw new Error(
          "Some products are no longer available in the requested quantity"
        );
      }

      appliedOperations.push(operation);
    }

    return appliedOperations;
  } catch (error) {
    if (appliedOperations.length > 0) {
      try {
        await restoreStock(appliedOperations);
      } catch (rollbackError) {
        console.error("Partial stock rollback failed:", rollbackError);
      }
    }

    throw error;
  }
};

/* =========================================================
   RESTORE STOCK
========================================================= */

const restoreStock = async (stockOperations) => {
  if (!Array.isArray(stockOperations) || !stockOperations.length) {
    return;
  }

  for (const operation of stockOperations) {
    /* -------------------------
       NORMAL PRODUCT
    ------------------------- */

    if (operation.type === "normal" || operation.type === "main") {
      const result = await Product.updateOne(
        {
          _id: operation.productId,
        },
        {
          $inc: {
            stock: operation.quantity,

            salesCount: -operation.quantity,
          },
        }
      );

      if (result.matchedCount === 0) {
        throw new Error("Failed to restore stock for a product");
      }
    } else {
      /* -------------------------
       VARIATION PRODUCT
    ------------------------- */
      const result = await Product.updateOne(
        {
          _id: operation.productId,

          variations: {
            $elemMatch: {
              option: operation.option,

              values: {
                $elemMatch: {
                  value: operation.value,
                },
              },
            },
          },
        },
        {
          $inc: {
            "variations.$[variation].values.$[value].stock": operation.quantity,
          },
        },
        {
          arrayFilters: [
            {
              "variation.option": operation.option,
            },
            {
              "value.value": operation.value,
            },
          ],
        }
      );

      if (result.matchedCount === 0) {
        throw new Error(
          `Failed to restore stock for variation ${operation.option}: ${operation.value}`
        );
      }
    }
  }
};

/* =========================================================
   PRODUCT STATUS
========================================================= */

const updateProductStatuses = async (productIds) => {
  if (!productIds?.length) {
    return;
  }

  const products = await Product.find({
    _id: {
      $in: productIds,
    },
  }).lean();

  const operations = [];

  for (const product of products) {
    let status;

    if (product.variations?.length > 0) {
      const hasMainStock = Number(product.stock || 0) > 0;

      const allOptionsHaveStock = product.variations.every((variation) =>
        variation.values?.some((value) => Number(value.stock || 0) > 0)
      );

      status = hasMainStock && allOptionsHaveStock ? "Active" : "Out Of Stock";
    } else {
      status = Number(product.stock || 0) > 0 ? "Active" : "Out Of Stock";
    }

    /*
        Manually inactive products should
        remain inactive.
      */

    if (product.status === "Inactive") {
      continue;
    }

    if (product.status !== status) {
      operations.push({
        updateOne: {
          filter: {
            _id: product._id,
          },

          update: {
            $set: {
              status,
            },
          },
        },
      });
    }
  }

  if (operations.length) {
    await Product.bulkWrite(operations, {
      ordered: false,
    });
  }
};

/* =========================================================
   BUILD STOCK OPERATIONS FROM ORDER
========================================================= */

const buildStockOperationsFromOrder = (order) => {
  const operations = [];

  for (const item of order.items) {
    const quantity = Number(item.quantity);

    const variations = normalizeVariations(item.variations);

    if (Object.keys(variations).length === 0) {
      operations.push({
        productId: item.product,
        type: "normal",
        quantity,
      });

      continue;
    }

    // Restore MAIN product stock once per order item
    operations.push({
      productId: item.product,
      type: "main",
      quantity,
    });

    // Restore each selected variation stock
    for (const [option, value] of Object.entries(variations)) {
      operations.push({
        productId: item.product,
        type: "variation",
        option,
        value,
        quantity,
      });
    }
  }

  return operations;
};

/* =========================================================
   RESTORE ORDER STOCK
   IMPORTANT:
   stockRestored acts as an idempotency guard.
========================================================= */

const restoreOrderStock = async (order) => {
  if (!order) {
    throw new Error("Order not found");
  }

  /*
      Only one request can successfully
      change stockRestored from false -> true.

      This prevents duplicate stock restoration
      if cancellation is triggered twice.
    */

  const guard = await Order.findOneAndUpdate(
    {
      _id: order._id,

      stockRestored: false,
    },
    {
      $set: {
        stockRestored: true,
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!guard) {
    return false;
  }

  const stockOperations = buildStockOperationsFromOrder(order);

  try {
    await restoreStock(stockOperations);

    await updateProductStatuses([
      ...new Set(
        stockOperations.map((operation) => operation.productId.toString())
      ),
    ]);

    const restoredProductIds = [
      ...new Set(
        stockOperations.map((operation) => operation.productId.toString())
      ),
    ];

    const restoredProducts = await Product.find({
      _id: {
        $in: restoredProductIds,
      },
    })
      .select("slug")
      .lean();

    for (const product of restoredProducts) {
      if (product.slug) {
        revalidateProductInBackground(product.slug);
      }
    }

    return true;
  } catch (error) {
    /*
        If restoration fails, allow another
        attempt later.
      */

    await Order.updateOne(
      {
        _id: order._id,

        stockRestored: true,
      },
      {
        $set: {
          stockRestored: false,
        },
      }
    );

    throw error;
  }
};

/* =========================================================
   SHIPPING ADDRESS VALIDATION
========================================================= */

const validateShippingAddress = (shippingAddress) => {
  if (!shippingAddress || typeof shippingAddress !== "object") {
    throw new Error("Shipping address is required");
  }

  const requiredFields = ["fullName", "phone", "address", "city"];

  for (const field of requiredFields) {
    if (!shippingAddress[field] || !String(shippingAddress[field]).trim()) {
      throw new Error(`${field} is required`);
    }
  }

  return {
    fullName: String(shippingAddress.fullName).trim(),

    phone: String(shippingAddress.phone).trim(),

    address: String(shippingAddress.address).trim(),

    city: String(shippingAddress.city).trim(),

    postalCode: shippingAddress.postalCode
      ? String(shippingAddress.postalCode).trim()
      : "",
  };
};

/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { items, shippingAddress, paymentMethod, idempotencyKey } = req.body;

    /* -------------------------
         IDEMPOTENCY CHECK
      ------------------------- */

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        user: userId,
        idempotencyKey,
      }).lean();

      if (existingOrder) {
        return res.status(200).json({
          success: true,
          order: existingOrder,
          message: "Order already placed",
        });
      }
    }

    /* -------------------------
         PAYMENT METHOD
      ------------------------- */

    if (!["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    /* -------------------------
         ADDRESS
      ------------------------- */

    const cleanAddress = validateShippingAddress(shippingAddress);

    /* -------------------------
         LOAD USER + SHIPPING
      ------------------------- */

    const [user, shipping] = await Promise.all([
      User.findById(userId),

      Shipping.findOne({
        isActive: true,
      }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    if (!shipping) {
      return res.status(400).json({
        success: false,
        message: "Shipping is currently unavailable",
      });
    }

    /* -------------------------
         BUILD ORDER DATA
      ------------------------- */

    const {
      orderItems,
      stockOperations,
      affectedProductIds: affectedIds,
      affectedProductSlugs,
    } = await buildOrderData(items);

    const affectedProductIds = affectedIds;

    /* -------------------------
         TOTALS
      ------------------------- */

    const subtotal = orderItems.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0
    );

    const shippingFee = user.isFreeShippingApplied
      ? 0
      : Number(shipping.fee || 0);

    const codFee = paymentMethod === "cod" ? COD_FEE : 0;

    const fee = codFee;

    const total = subtotal + shippingFee + fee;

    /* -------------------------
         APPLY STOCK

         IMPORTANT:
         applyStockUpdates owns rollback
         if a stock operation fails.
      ------------------------- */

    const appliedStockOperations = await applyStockUpdates(stockOperations);

    /*
        Stock has now been successfully
        deducted.
      */

    await updateProductStatuses(affectedProductIds);

    /* -------------------------
         CREATE ORDER
      ------------------------- */

    let order;

    try {
      order = await Order.create({
        user: user._id,

        items: orderItems,

        shippingAddress: cleanAddress,

        paymentMethod,

        paymentVerification: "pending",

        orderStatus: "packaging",

        subtotal,

        shippingFee,

        codFee,

        fee,

        total,

        stockRestored: false,

        /*
              Save the idempotency key so
              retries can find this order.
            */
        ...(idempotencyKey ? { idempotencyKey } : {}),
      });
    } catch (orderError) {
      /*
          Two requests can pass the initial
          findOne() check at the same time.

          The unique index on idempotencyKey
          allows only one Order.create() to win.

          The losing request must restore the
          stock it deducted, then return the
          winning order.
        */

      if (orderError?.code === 11000 && idempotencyKey) {
        await restoreStock(appliedStockOperations);

        await updateProductStatuses(affectedProductIds);

        const winningOrder = await Order.findOne({
          user: userId,
          idempotencyKey,
        }).lean();

        return res.status(200).json({
          success: true,
          order: winningOrder,
          message: "Order already placed",
        });
      }

      /*
          Stock was deducted successfully,
          but order creation failed.

          Restore it ONCE here.

          The outer catch below does NOT
          restore stock again.
        */

      try {
        await restoreStock(appliedStockOperations);

        await updateProductStatuses(affectedProductIds);
      } catch (rollbackError) {
        console.error("Order creation stock rollback failed:", rollbackError);
      }

      throw orderError;
    }

    /* -------------------------
         FREE SHIPPING CLAIM
      ------------------------- */

    if (user.isFreeShippingApplied) {
      const updatedUser = await User.updateOne(
        {
          _id: user._id,

          isFreeShippingApplied: true,
        },
        {
          $set: {
            isFreeShippingApplied: false,
          },
        }
      );

      if (updatedUser.modifiedCount === 0) {
        try {
          await restoreOrderStock(order);
        } catch (rollbackError) {
          console.error(
            "Free shipping failure stock rollback failed:",
            rollbackError
          );
        }

        await Order.updateOne(
          {
            _id: order._id,
          },
          {
            $set: {
              orderStatus: "cancelled",
            },
          }
        );

        throw new Error("Unable to complete order");
      }
    }

    /* -------------------------
         PURCHASE EMAIL
      ------------------------- */

    for (const slug of affectedProductSlugs) {
      revalidateProductInBackground(slug);
    }

    try {
      await sendPurchaseEmail({
        order,

        buyerName: user.name,

        buyerEmail: user.email,
      });
    } catch (emailError) {
      /*
          Email failure should NOT cancel
          an otherwise successful order.
        */

      console.error("Purchase confirmation email delivery failed:", emailError);
    }

    /* -------------------------
         SUCCESS
      ------------------------- */

    return res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order,
    });
  } catch (error) {
    /*
        IMPORTANT:

        There is NO stock rollback here.

        Every stock-related failure is already
        handled by the specific function responsible
        for that operation.

        This prevents double restoration.
      */

    console.error("Create order error:", error);

    return res.status(400).json({
      success: false,

      message: error.message || "Failed to create order",
    });
  }
};

/* =========================================================
   GET MY ORDERS
========================================================= */

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
    });
  }
};

/* =========================================================
   GET MY ORDER
========================================================= */

export const getMyOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,

      user: req.user._id,
    })
      .populate("items.product", "productId name slug images")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/* =========================================================
   GET ALL ORDERS
========================================================= */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "productId name slug images")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

/* =========================================================
   GET ORDER BY ID
========================================================= */

export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate(
        "items.product",
        "productId name slug images stock variations status"
      )
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

/* =========================================================
   UPDATE PAYMENT VERIFICATION
========================================================= */

export const updatePaymentVerification = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { paymentVerification } = req.body;

    if (!["pending", "verified", "rejected"].includes(paymentVerification)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentVerification === paymentVerification) {
      return res.status(200).json({
        success: true,
        message: "Payment verification already has this status",
        order,
      });
    }

    /* -------------------------
         REJECT PAYMENT
      ------------------------- */

    if (paymentVerification === "rejected") {
      if (["delivered", "received"].includes(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Delivered orders cannot have payment rejected",
        });
      }

      await restoreOrderStock(order);

      order.paymentVerification = "rejected";
      order.orderStatus = "cancelled";
      await order.save();

      try {
        const buyer = await User.findById(order.user)
          .select("name email")
          .lean();

        await sendOrderCancelledEmail({
          order,
          buyerName: buyer?.name,
          buyerEmail: buyer?.email,
        });
      } catch (emailError) {
        console.error("Cancellation email failed:", emailError);
      }

      return res.status(200).json({
        success: true,
        message: "Payment rejected and stock restored",
        order,
      });
    }

    /* -------------------------
         OTHER PAYMENT STATUS
      ------------------------- */

    order.paymentVerification = paymentVerification;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verification updated",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment verification",
    });
  }
};

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

export const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { orderStatus } = req.body;

    const allowedStatuses = [
      "packaging",
      "shipped",
      "delivered",
      "received",
      "cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled orders cannot be updated",
      });
    }

    if (order.orderStatus === "delivered" && orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }

    if (order.orderStatus === "received" && orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Received orders cannot be cancelled",
      });
    }

    /* -------------------------
     SAVE PREVIOUS STATUS
  ------------------------- */

    const previousOrderStatus = order.orderStatus;

    /* -------------------------
     CANCEL ORDER
  ------------------------- */

    if (orderStatus === "cancelled") {
      await restoreOrderStock(order);
    }

    order.orderStatus = orderStatus;

    await order.save();

    /* -------------------------
     STATUS EMAILS
  ------------------------- */

    if (orderStatus === "delivered" && previousOrderStatus !== "delivered") {
      try {
        const buyer = await User.findById(order.user)
          .select("name email")
          .lean();

        await sendDeliveryEmail({
          order,
          buyerName: buyer?.name,
          buyerEmail: buyer?.email,
        });
      } catch (emailError) {
        console.error("Delivery email failed:", emailError);
      }
    }

    if (orderStatus === "cancelled" && previousOrderStatus !== "cancelled") {
      try {
        const buyer = await User.findById(order.user)
          .select("name email")
          .lean();

        await sendOrderCancelledEmail({
          order,
          buyerName: buyer?.name,
          buyerEmail: buyer?.email,
        });
      } catch (emailError) {
        console.error("Cancellation email failed:", emailError);
      }
    }

    return res.status(200).json({
      success: true,

      message:
        orderStatus === "cancelled"
          ? "Order cancelled and stock restored"
          : "Order status updated",

      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

/* =========================================================
   MARK ORDER RECEIVED
========================================================= */

export const markOrderReceived = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be marked as received",
      });
    }

    order.orderStatus = "received";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as received",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark order as received",
    });
  }
};

/* =========================================================
   REQUEST REFUND
========================================================= */

/*
export const requestRefund = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { refundAmount, refundReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,

      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["delivered", "received"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Refund can only be requested after delivery",
      });
    }

    if (order.refundStatus !== "none") {
      return res.status(400).json({
        success: false,
        message: "A refund request already exists",
      });
    }

    const amount = Number(refundAmount ?? order.total);

    if (!Number.isFinite(amount) || amount <= 0 || amount > order.total) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount",
      });
    }

    order.refundRequested = true;

    order.refundAmount = amount;

    order.refundReason = String(refundReason || "").trim();

    order.refundStatus = "pending";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Refund request submitted",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to request refund",
    });
  }
};
*/


/* =========================================================
   UPDATE REFUND
========================================================= */

export const updateRefund = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { refundStatus, refundNote } = req.body;

    const allowedStatuses = [
      "none",
      "pending",
      "approved",
      "rejected",
      "processed",
    ];

    if (!allowedStatuses.includes(refundStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.refundRequested && refundStatus !== "none") {
      return res.status(400).json({
        success: false,
        message: "No refund request exists for this order",
      });
    }

    order.refundStatus = refundStatus;

    order.refundNote = String(refundNote || "").trim();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Refund updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update refund",
    });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if the query is a valid MongoDB ObjectId or custom orderNumber (e.g., ORD-XXXXXXX)
    let query = {};
    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: orderId };
    } else {
      query = { orderNumber: orderId.toUpperCase() };
    }

    // Select only the core fields required for the status/loading screen
    const order = await Order.findOne(query).select(
      "orderNumber orderStatus paymentVerification paymentMethod total createdAt"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order status",
      error: error.message,
    });
  }
};

export const getMyApprovedRefundOrders = async (req, res) => {
  
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }
    const orders = await Order.find({
      user: userId,
      refundRequested: true,
      refundStatus: "approved",
    })
      .populate("items.product", "productId name slug images")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get my approved refund orders error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch your approved refund orders",
      });
  }
};

export const requestRefund = async (req, res) => {
  try {

    const { orderNumber } = req.body;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: "Order number is required",
      });
    }

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.refundRequested = true;
    order.refundStatus = "pending";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Refund request submitted successfully",
      order,
    });
  } catch (error) {
    console.error("Request refund error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit refund request",
    });
  }
};
