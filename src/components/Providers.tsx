"use client";

import { Toaster } from "react-hot-toast";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1E293B",
            color: "#F8FAFC",
            border: "1px solid #334155",
          },
          success: {
            iconTheme: {
              primary: "#2563EB",
              secondary: "#F8FAFC",
            },
          },
        }}
      />
    </>
  );
}
