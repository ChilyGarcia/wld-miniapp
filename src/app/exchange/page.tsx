"use client";

import React, { useState } from "react";

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

  const handleContinue = () => {
    if (step === 1 && formData.paymentMethod) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-[460px] bg-white rounded-lg shadow-md p-8">
        {/* Progress Steps */}
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

              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg> */}
            </div>

            {/* Exchange Rates */}
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
                    type="number"
                    value={formData.sendAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sendAmount: parseFloat(e.target.value),
                        receiveAmount: parseFloat(e.target.value) * 139,
                      }))
                    }
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
                    type="number"
                    value={formData.receiveAmount}
                    readOnly
                    className="ml-auto w-24 text-right border-0 p-0 text-lg font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
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
                  <option value="">Seleccionar una opción</option>
                  <option value="bank">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="mobile">Pago Móvil</option>
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
              className="w-full bg-[#14162c] hover:bg-[#14162c]/90 text-white py-4 px-4 rounded-lg font-medium"
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
