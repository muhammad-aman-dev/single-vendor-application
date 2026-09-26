import CartClient from "./CartClient";

export const metadata = {
  title: "Your Cart | Rebel",
  description:
    "Review the items in your cart, update quantities, and proceed securely to checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}
