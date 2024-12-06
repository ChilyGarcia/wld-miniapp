"use client";

import React, { useEffect } from "react";
import {
  MiniKit,
  ResponseEvent,
  Tokens,
  tokenToDecimals,
} from "@worldcoin/minikit-js";

const HomePage = () => {
  const handlePayment = async () => {
    // Payload de pago
    const paymentPayload = {
      reference: "test-transaction-12345", // Identificador único
      to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Dirección de destino (de prueba)
      tokens: [
        {
          symbol: Tokens.WLD, // Moneda Worldcoin
          token_amount: tokenToDecimals(1, Tokens.WLD).toString(), // 1 WLD
        },
      ],
      description: "Pago de prueba con Worldcoin",
    };

    // Verifica si World App está instalada
    if (MiniKit.isInstalled()) {
      MiniKit.commands.pay(paymentPayload);
    } else {
      alert("World App no está instalada en este dispositivo.");
    }
  };

  useEffect(() => {
    // Maneja las respuestas del pago
    if (MiniKit.isInstalled()) {
      MiniKit.subscribe(ResponseEvent.MiniAppPayment, (response) => {
        console.log("Respuesta del pago:", response);
        if (response.status === "success") {
          alert("¡Pago exitoso!");
        } else {
          alert("El pago falló.");
        }
      });
    }
    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Integración con Worldcoin Mini Apps</h1>
      <button
        onClick={handlePayment}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Enviar Pago
      </button>
    </div>
  );
};

export default HomePage;
