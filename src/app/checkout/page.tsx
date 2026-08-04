"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CheckoutAuthGate from "@/components/checkout/CheckoutAuthGate";
import Spinner from "@/components/ui/Spinner";

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch {
        // Supabase no disponible en modo mockup
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

  if (!user) {
    return <CheckoutAuthGate onSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        Finalizar compra
      </h1>
      <CheckoutStepper />
    </div>
  );
}
