import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrder,
  getAllOrders,
  getOrderById,
  updatePaymentVerification,
  updateOrderStatus,
  markOrderReceived,
  requestRefund,
  updateRefund,
  getOrderStatus,
  getMyApprovedRefundOrders
} from "../controllers/orderController.js";
import { userAuthCheck } from "../middleware/authMiddleware.js";
import { adminAuthCheck } from "../middleware/adminMiddleware.js";

const ordersRouter = express.Router();

ordersRouter.post("/create-order", userAuthCheck, createOrder);

ordersRouter.get("/my", userAuthCheck, getMyOrders);
ordersRouter.get("/my/:id", userAuthCheck, getMyOrder);
ordersRouter.get("/my-refunds", userAuthCheck, getMyApprovedRefundOrders )

ordersRouter.patch("/:id/received", userAuthCheck, markOrderReceived);
// ordersRouter.post("/:id/refund", userAuthCheck, requestRefund);
ordersRouter.post("/request-refund", adminAuthCheck, requestRefund);

ordersRouter.get("/orders", adminAuthCheck, getAllOrders);
ordersRouter.get("/:id", adminAuthCheck, getOrderById);

ordersRouter.get("/status/:orderId", getOrderStatus);

ordersRouter.patch(
  "/:id/payment-verification",
  adminAuthCheck,
  updatePaymentVerification
);


ordersRouter.patch("/:id/status", adminAuthCheck, updateOrderStatus);

ordersRouter.patch("/:id/refund", adminAuthCheck, updateRefund);



export default ordersRouter;