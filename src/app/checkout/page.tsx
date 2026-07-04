"use client";

import { useEffect, useState } from "react";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutAuthGate from "@/components/checkout/CheckoutAuthGate";
import Spinner from "@/components/ui/Spinner";

export default function CheckoutPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/auth/account");
        const data = (await response.json()) as { isAuthenticated: boolean };
        setAuthenticated(data.isAuthenticated);
      } catch {
        setAuthenticated(false);
      }
      setChecked(true);
    })();
  }, []);

  if (!checked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!authenticated) {
    return <CheckoutAuthGate />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        Finalizar compra
      </h1>
      <CheckoutStepper />
    </div>
  );
}
