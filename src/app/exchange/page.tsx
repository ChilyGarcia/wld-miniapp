"use client";

import React, { useState } from "react";

import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useEffect } from "react";
import { IConfiguration } from "@/interfaces/configuration.interface";

const decimalPattern = /^[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]*)?$/;

export default function CurrencyExchange() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    sendAmount: 1,
    receiveAmount: 139,
    paymentMethod: "",
    name: "",
    email: "",
    phone: "",
  });
  const [activeInput, setActiveInput] = useState("");
  const [sendValue, setSendValue] = useState("");
  const [receiveValue, setReceiveValue] = useState("");
  const [inverted, setInverted] = useState(1);
  const [configuration, setConfiguration] = useState<IConfiguration>();

  const handleContinue = () => {
    if (step === 1 && formData.paymentMethod) {
      setStep(2);
    }

    sendPayment();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const fetchConfiguration = async () => {
    try {
      const response = await fetch("https://wld.lol/api/v1/configurations");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      console.log("Esta es la configuración que llega", result);

      setConfiguration(result);

      return result;
    } catch (error) {
      console.error("Hubo un problema con la operación fetch:", error);
      return null;
    }
  };

  const fetchConvert = async (data: any) => {
    console.log("Esta es la data que esta llegando al fetch convert", data);
    try {
      console.log("Haciendo la petición");
      const response = await fetch(
        `https://wld.lol/api/v1/convert?amount=${data.amount}&inverted=${data.inverted}`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();

      console.log(result);
      return result;
    } catch (error) {
      console.error("Hubo un problema con la operación fetch:", error);
      return null;
    }
  };

  useEffect(() => {
    const body = { amount: parseFloat("1"), inverted: 1 };

    fetchConfiguration();

    fetchConvert(body).then((response) => {
      if (response && response.converted) {
        setSendValue("1");
        setReceiveValue(parseFloat(response.converted).toLocaleString("en-US"));
      } else {
        console.error("La respuesta no tiene el formato esperado", response);
      }
    });
  }, []);

  const handleSendChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let inputValue = event.target.value.replace(/,/g, "");

    if (inputValue.match(decimalPattern)) {
      setSendValue(inputValue);

      let body, response;

      if (inputValue.trim() === "") {
        inputValue = "0";
      }

      body = { amount: parseFloat(inputValue), inverted: 1 };
      setInverted(1);
      response = await fetchConvert(body);

      if (response && response.converted) {
        const inputElement = document.getElementById(
          "receive"
        ) as HTMLInputElement;

        if (inputElement) {
          inputElement.value = parseFloat(response.converted).toLocaleString(
            "en-US"
          );
        }

        setReceiveValue(parseFloat(response.converted).toLocaleString("en-US"));
      } else {
        console.error("La respuesta no tiene el formato esperado", response);
      }
    }
  };

  const handleReceiveChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let inputValue = event.target.value.replace(/,/g, "");

    const formattedValue = parseFloat(inputValue).toLocaleString("en-US");
    setReceiveValue(formattedValue);

    let body, response;

    if (inputValue.trim() === "") {
      inputValue = "0";
      setReceiveValue("0");
    }

    body = { amount: parseFloat(inputValue), inverted: 0 };
    response = await fetchConvert(body);
    setInverted(0);

    const inputElement = document.getElementById("send") as HTMLInputElement;

    if (inputElement && response) {
      inputElement.value = response.converted;
    }

    setSendValue(response.converted);
  };

  useEffect(() => {
    setTimeout(() => {
      if (MiniKit.isInstalled()) {
      } else {
        const environment = window.location.origin;
        const userAgent = navigator.userAgent;
        const errorMessage = `MiniKit no está instalado. 
          Environment: ${environment}, 
          User Agent: ${userAgent}`;
        console.error(errorMessage);
      }
    }, 100);

    // Suscribe a los eventos de respuesta de pago
    MiniKit.subscribe(ResponseEvent.MiniAppPayment, async (response) => {
      if (response.status === "success") {
        try {
          const res = await fetch(`/api/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await res.json();

          if (result.success) {
            alert("¡Pago exitoso!");
          } else {
            const errorMessage = "Error al confirmar el pago.";

            alert(errorMessage);
          }
        } catch (error) {
          console.error("Error al procesar la respuesta del pago:", error);
        }
      } else {
        console.log("Estado de pago no exitoso", response);
      }
    });

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }, []);

  useEffect(() => {
    console.log("receiove value", receiveValue);
  }, [receiveValue]);

  const sendPayment = async () => {
    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
      });
      const { id } = await res.json();

      const payload: PayCommandInput = {
        reference: id,
        to: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
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
      } else {
        const errorMessage =
          "MiniKit no está instalado al enviar el comando de pago.";

        console.error(errorMessage);
      }
    } catch (error) {
      console.error("Error al iniciar el pago:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-[460px] bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                step === 1
                  ? "bg-[#14162c] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className="w-20 h-[2px] bg-gray-200 mx-2" />
            <div
              className={`rounded-full w-10 h-10 flex items-center justify-center font-medium ${
                step === 2
                  ? "bg-[#14162c] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              <h2 className="text-xl font-medium">Intercambio wld</h2>

              <img src="/icon/wld-icon.png" className="w-4"></img>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    ENVÍAS
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <img src="/icon/wld-icon.png" className="w-8"></img>
                  </div>
                  <input
                    name="sendAmount"
                    type="number"
                    value={sendValue}
                    onChange={handleSendChange}
                    className="ml-auto w-24 text-right border-0 p-0 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg">
                <div className="px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">
                    RECIBES
                  </span>
                </div>
                <div className="p-4 flex items-center">
                  <div className="flex items-center gap-2">
                    <img src="/icon/colombia-icon.png" className="w-8"></img>
                  </div>
                  <input
                    name="receiveAmount"
                    type="text"
                    onChange={handleReceiveChange}
                    value={receiveValue}
                    className="ml-auto w-24 text-right border-0 p-0 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">
                Método de consignación
              </label>
              <div className="relative">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                >
                  {configuration?.payment_methods?.map((method) => (
                    <option key={method[0]} value={method[0]}>
                      {method[1]}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-4 px-4 rounded-lg font-medium ${
                formData.paymentMethod
                  ? "bg-[#14162c] hover:bg-[#14162c]/90 text-white"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
              onClick={handleContinue}
              disabled={!formData.paymentMethod}
            >
              CONTINUAR
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-center mb-6">
              Información Personal
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ingrese su nombre completo"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Ingrese su correo electrónico"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Ingrese su número de teléfono"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-lg"
                onClick={handleBack}
              >
                Atrás
              </button>
              <button
                className="w-full bg-[#14162c] hover:bg-[#14162c]/90 text-white font-medium py-2 px-4 rounded-lg"
                onClick={() => console.log("Form submitted:", formData)}
              >
                Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}