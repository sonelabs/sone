// CursorContext.tsx
import React, { createContext, useState, useContext } from 'react';

export interface CursorPosition {
  x: number;
  y: number;
}

interface CursorContextType {
  cursor: CursorPosition;
  setCursor: (pos: CursorPosition) => void;
}

const CursorContext = createContext<CursorContextType | null>(null);

export const CursorProvider: React.FC = ({ children }) => {
  const [cursor, setCursor] = useState<CursorPosition>({ x: 0, y: 0 });
  return (
    <CursorContext.Provider value={{ cursor, setCursor }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
