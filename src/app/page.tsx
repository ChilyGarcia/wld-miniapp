"use client";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      console.error("MiniKit no está instalado en este entorno.");
      return;
    }

    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (response) => {
      if (response.status === "success") {
        const res = await fetch(`/api/confirm-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        const result = await res.json();
        if (result.success) {
          alert("¡Pago exitoso!");
        } else {
          alert("Error al confirmar el pago.");
        }
      }
    });

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }, []);

  const sendPayment = async () => {
    const res = await fetch("/api/initiate-payment", {
      method: "POST",
    });
    const { id } = await res.json();

    const payload: PayCommandInput = {
      reference: id,
      to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Dirección de prueba
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(1, Tokens.WLD).toString(),
        },
        {
          symbol: Tokens.USDCE,
          token_amount: tokenToDecimals(3, Tokens.USDCE).toString(),
        },
      ],
      description: "Prueba de pago para MiniKit",
    };

    if (MiniKit.isInstalled()) {
      MiniKit.commands.pay(payload);
    }
  };

  return (
    <div>
      <h1>Prueba de Pago</h1>
      <button onClick={sendPayment}>Enviar Pago</button>
    </div>
  );
}
