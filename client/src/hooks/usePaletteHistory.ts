import { useState, useEffect, useCallback } from "react";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
}

interface PaletteEntry {
  id: string;
  colors: Color[];
  timestamp: number;
  imageDataUrl?: string; // Optional thumbnail
}

const STORAGE_KEY = "hexy_palette_history";
const MAX_HISTORY = 20; // Keep last 20 palettes

export function usePaletteHistory() {
  const [history, setHistory] = useState<PaletteEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PaletteEntry[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Error loading palette history:", error);
    }
  }, []);

  // Save a new palette to history
  const savePalette = useCallback((colors: Color[], imageDataUrl?: string) => {
    const newEntry: PaletteEntry = {
      id: `palette_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      colors,
      timestamp: Date.now(),
      imageDataUrl,
    };

    setHistory((prev) => {
      const updated = [newEntry, ...prev].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving palette history:", error);
      }
      return updated;
    });
  }, []);

  // Delete a specific palette from history
  const deletePalette = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Error deleting palette:", error);
      }
      return updated;
    });
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing palette history:", error);
    }
  }, []);

  return {
    history,
    savePalette,
    deletePalette,
    clearHistory,
  };
}

