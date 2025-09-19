
import React from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import { CheckCircle2, X, ArrowDown } from 'lucide-react';

type ValuePropositionDict = Dictionary["landingPage"]["valueProposition"];

export function OportunidadSection({ dictionary }: { dictionary: ValuePropositionDict }) {
  const stats = [
    { 
      label: dictionary.stats.stat1
    },
    { 
      label: dictionary.stats.stat2
    },
    { 
      label: dictionary.stats.stat3
    }
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
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-16 px-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 mb-4">
            <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            {dictionary.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-sm font-medium text-violet-300">{stat.label.title}</p>
              <div className="text-xl md:text-2xl font-bold text-white mb-2">
                {stat.label.value}
              </div>
              <p className="text-xs text-slate-400">{stat.label.subtitle}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-red-950/80 to-purple-950/60 backdrop-blur-xl border border-red-500/20 hover:border-red-400/40 transition-all duration-500 group-hover:scale-[1.02] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-red-500/20 backdrop-blur-sm border border-red-500/30">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{dictionary.from.title}</h3>
                  <p className="text-red-200/70 text-sm">Situación actual</p>
                </div>
              </div>
              
              <div className="space-y-5">
                {beforeItems.map((item, index) => (
                  <div key={index} className="group/item relative">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-red-900/20 border border-red-500/10 hover:border-red-500/30 hover:bg-red-900/30 transition-all duration-300 hover:translate-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                      </div>
                      <span className="text-red-100 group-hover/item:text-white transition-colors font-medium">
                        {item}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/50 to-pink-500/50 rounded-b-3xl" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-teal-950/60 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-500 group-hover:scale-[1.02] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{dictionary.to.title}</h3>
                  <p className="text-emerald-200/70 text-sm">Con WasteWise</p>
                </div>
              </div>
              
              <div className="space-y-5">
                {afterItems.map((item, index) => (
                  <div key={index} className="group/item relative">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-900/30 transition-all duration-300 hover:translate-x-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <span className="text-emerald-100 group-hover/item:text-white transition-colors font-medium">
                        {item}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-b-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
