
"use client";

import React, { createContext, useContext } from 'react';
import type { Dictionary } from '@/lib/get-dictionary';

const DictionariesContext = createContext<Dictionary | null>(null);

export function DictionariesProvider({ children, dictionary }: { children: React.ReactNode, dictionary: Dictionary }) {
  return (
    <DictionariesContext.Provider value={dictionary}>
      {children}
    </DictionariesContext.Provider>
  );
}

export function useDictionaries() {
  return useContext(DictionariesContext);
}
