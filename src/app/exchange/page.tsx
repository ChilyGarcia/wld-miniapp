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
import { IOrder } from "@/interfaces/oder.interface";

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
    document_number: "",
    bank_account: "1",
  });

  const [sendValue, setSendValue] = useState("");
  const [receiveValue, setReceiveValue] = useState("");
  const [inverted, setInverted] = useState(1);
  const [configuration, setConfiguration] = useState<IConfiguration>();
  const [body, setBody] = useState<IOrder>();

  const fetchStore = async (data: any) => {
    try {
      const response = await fetch("https://wld.lol/api/v1/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":
            "20ae3f163b89fdbb776cdfa4461685dd6e609709fc142a9fe9f41a7810c7cffa",
        },
        body: JSON.stringify(data),
      });

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

  const handleContinue = () => {
    if (step === 1 && formData.paymentMethod) {
      setStep(2);
    }

    const sanitizedReceiveValue = receiveValue.replace(/,/g, "");

    if (inverted === 1) {
      setBody({
        amount: parseFloat(sendValue),
        bank: formData.paymentMethod,
        bank_account: "",
        customer_document_number: "",
        customer_email: formData.email,
        customer_full_name: formData.name,
        customer_phone_number: formData.phone,
        inverted: "1",
        referrals_reference: "",
      });
    } else {
      setBody({
        amount: parseFloat(sanitizedReceiveValue),
        bank: formData.paymentMethod,
        bank_account: "",
        customer_document_number: "",
        customer_email: formData.email,
        customer_full_name: formData.name,
        customer_phone_number: formData.phone,
        inverted: "0",
        referrals_reference: "",
      });
    }
  };

  const isFinalStepValid = () => {
    if (!body) return false;

    const requiredFields = [
      "customer_full_name",
      "amount",
      "bank",
      "customer_document_number",
      "customer_email",
      "customer_phone_number",
      "inverted",
    ];

    const validationResults = requiredFields.map((field) => {
      const isValid = !!body[field as keyof IOrder];

      return isValid;
    });

    return validationResults.every((isValid) => isValid);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    setBody((prevState) => ({
      ...prevState,
      customer_full_name: formData.name,
      amount: prevState?.amount || 0,
      bank: prevState?.bank || "",
      customer_document_number: formData.document_number,
      customer_email: formData.email,
      customer_phone_number: formData.phone,
      inverted: prevState?.inverted || "0",
      bank_account: formData.bank_account,
      referrals_reference: prevState?.referrals_reference || "",
    }));
  };

  useEffect(() => {
    setBody((prevState) => ({
      ...prevState,
      customer_full_name: formData.name,
      amount: prevState?.amount || 0,
      bank: prevState?.bank || "",
      customer_document_number: formData.document_number,
      customer_email: formData.email,
      customer_phone_number: formData.phone,
      inverted: prevState?.inverted || "0",
      bank_account: formData.bank_account,
      referrals_reference: prevState?.referrals_reference || "",
    }));
  }, [formData]);

  const sendPayment = async () => {
    try {
      const res = await fetch("/api/initiate-payment", {
        method: "POST",
      });
      const { id } = await res.json();

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
        MiniKit.commands.pay(payload);

        fetchStore(body);
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  placeholder="Ingrese su número de teléfono"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Tipo de cuenta
                </label>
                <div className="relative">
                  <select
                    value={formData.bank_account}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bank_account: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
                  >
                    {configuration?.bank_types?.map((method) => (
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

              <div className="space-y-2">
                <label
                  htmlFor="document_number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Numero de cuenta
                </label>
                <input
                  id="document_number"
                  type="number"
                  value={formData.document_number}
                  onChange={handleInputChange}
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
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isFinalStepValid()
                    ? "bg-[#14162c] hover:bg-[#14162c]/90 text-white"
                    : "bg-gray-300 text-gray-400 cursor-not-allowed"
                }`}
                onClick={sendPayment}
                disabled={!isFinalStepValid()}
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
