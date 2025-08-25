// src/components/MiniKitProvider.tsx
import { useEffect, type ReactNode } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      MiniKit.install(); // inicializa el SDK dentro de World App
      // console.log("MiniKit instalado?", MiniKit.isInstalled());
    } catch {}
  }, []);

  return <>{children}</>;
}
