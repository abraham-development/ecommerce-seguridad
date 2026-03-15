import type { Metadata } from "next";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        Finalizar compra
      </h1>
      <CheckoutStepper />
    </div>
  );
}
