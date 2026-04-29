import { useEffect, useState } from "react";

const FONT_SCALE_LEVELS = [0.9, 1, 1.1, 1.2];
const DEFAULT_FONT_SCALE_INDEX = 1;

export function useFontScale() {
  const [fontScaleIndex, setFontScaleIndex] = useState(DEFAULT_FONT_SCALE_INDEX);

  useEffect(() => {
    const storedIndex = Number(window.localStorage.getItem("appFontScaleIndex"));
    if (Number.isInteger(storedIndex) && FONT_SCALE_LEVELS[storedIndex]) {
      setFontScaleIndex(storedIndex);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-font-scale",
      String(FONT_SCALE_LEVELS[fontScaleIndex])
    );
    window.localStorage.setItem("appFontScaleIndex", String(fontScaleIndex));
  }, [fontScaleIndex]);

  const increaseFontSize = () => {
    setFontScaleIndex((currentIndex) =>
      Math.min(currentIndex + 1, FONT_SCALE_LEVELS.length - 1)
    );
  };

  const decreaseFontSize = () => {
    setFontScaleIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const resetFontSize = () => {
    setFontScaleIndex(DEFAULT_FONT_SCALE_INDEX);
  };

  return {
    decreaseFontSize,
    increaseFontSize,
    resetFontSize,
  };
}
