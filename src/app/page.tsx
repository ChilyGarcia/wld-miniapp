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
    setTimeout(() => {
      if (MiniKit.isInstalled()) {
        LogRocket.log("MiniKit instalado y listo para usarse.");
      } else {
        const environment = window.location.origin;
        const userAgent = navigator.userAgent;
        const errorMessage = `MiniKit no está instalado. 
          Environment: ${environment}, 
          User Agent: ${userAgent}`;
        console.error(errorMessage);
        LogRocket.error(errorMessage);
      }
    }, 100);

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
          );

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

      LogRocket.log("Referencia de pago generada", id);

      const payload: PayCommandInput = {
        reference: id,
        to: "0xb0adb530f1d2c74fa2344e3da4daa47a08ffb2f6",
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(0.001, Tokens.WLD).toString(),
          },
        ],
        description: "Prueba de pago para MiniKit",
      };

      if (MiniKit.isInstalled()) {
        LogRocket.log("Enviando comando de pago", payload);
        MiniKit.commands.pay(payload);
      } else {
        const errorMessage =
          "MiniKit no está instalado al enviar el comando de pago.";
        LogRocket.error(errorMessage);
        console.error(errorMessage);
      }
    } catch (error) {
      LogRocket.error("Error al iniciar el pago", error);
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
