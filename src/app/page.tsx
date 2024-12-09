"use client";

import LogRocket from "logrocket";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useEffect } from "react";

// Inicializa LogRocket con tu identificador de proyecto
LogRocket.init("pzjgr2/vakano-apps");

export default function Home() {
  useEffect(() => {
    LogRocket.log("Mini App iniciada"); // Log de inicio

    if (!MiniKit.isInstalled()) {
      const errorMessage = "MiniKit no está instalado en este entorno.";
      console.error(errorMessage);
      LogRocket.error(errorMessage); // Log de error
      return;
    }

    // Suscribe a los eventos de respuesta de pago
    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (response) => {
      LogRocket.log("Respuesta de MiniAppPayment recibida", response); // Log del evento

      if (response.status === "success") {
        try {
          const res = await fetch(`/api/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await res.json();

          LogRocket.log(
            "Respuesta del backend de confirmación de pago",
            result
          ); // Log del backend

          if (result.success) {
            LogRocket.log("Pago confirmado con éxito");
            alert("¡Pago exitoso!");
          } else {
            const errorMessage = "Error al confirmar el pago.";
            LogRocket.error(errorMessage);
            alert(errorMessage);
          }
        } catch (error) {
          LogRocket.error("Error al procesar la respuesta del pago", error); // Log de error
          console.error("Error al procesar la respuesta del pago:", error);
        }
      } else {
        LogRocket.warn("Estado del pago no exitoso", response); // Log de advertencia
      }
    });

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }, []);

  const sendPayment = async () => {
    LogRocket.log("Intentando iniciar un pago");

    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
      });
      const { id } = await res.json();

      LogRocket.log("Referencia de pago generada", id); // Log de referencia

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
        LogRocket.log("Enviando comando de pago", payload); // Log del comando de pago
        MiniKit.commands.pay(payload);
      } else {
        const errorMessage =
          "MiniKit no está instalado al enviar el comando de pago.";
        LogRocket.error(errorMessage);
        console.error(errorMessage);
      }
    } catch (error) {
      LogRocket.error("Error al iniciar el pago", error); // Log de error
      console.error("Error al iniciar el pago:", error);
    }
  };

  return (
    <div>
      <h1>Prueba de Pago</h1>
      <button onClick={sendPayment}>Enviar Pago</button>
    </div>
  );
}
