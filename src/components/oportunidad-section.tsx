
import React from "react";
import type { Dictionary } from "@/lib/get-dictionary";

type ValuePropositionDict = Dictionary["landingPage"]["valueProposition"];

export function OportunidadSection({ dictionary }: { dictionary: ValuePropositionDict }) {
  const stats = [
    dictionary.stats.stat1,
    dictionary.stats.stat2,
    dictionary.stats.stat3,
  ];

  const beforeItems = [
    dictionary.from.item1,
    dictionary.from.item2,
    dictionary.from.item3,
    dictionary.from.item4,
  ];

  const afterItems = [
    dictionary.to.item1,
    dictionary.to.item2,
    dictionary.to.item3,
    dictionary.to.item4,
  ];

  return (
    <section className="bg-slate-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Encabezado */}
        <div className="flex flex-col items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v12m0 0l-3-3m3 3l3-3M4 21h16"
            />
          </svg>
          <h2 className="text-3xl font-bold sm:text-4xl">
            {dictionary.title}
          </h2>
        </div>

        {/* Datos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {stats.map((text, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-green-400 text-2xl">✔</span>
              <p>{text}</p>
            </div>
          ))}
        </div>

        {/* Antes / Después */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Antes */}
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-6 text-left">
            <h3 className="text-red-400 font-semibold text-xl mb-4">{dictionary.from.title}</h3>
            <ul className="space-y-3">
              {beforeItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-red-400">✖</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Después */}
          <div className="bg-green-900/40 border border-green-700 rounded-lg p-6 text-left">
            <h3 className="text-green-400 font-semibold text-xl mb-4">{dictionary.to.title}</h3>
            <ul className="space-y-3">
              {afterItems.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-400">✔</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
