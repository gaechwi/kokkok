import { useMemo } from "react";
import { Dimensions, PixelRatio } from "react-native";

export const useTruncateText = () => {
  const screenWidth = Dimensions.get("window").width;

  const calculateMaxChars = useMemo(() => {
    const fontScale = PixelRatio.getFontScale();
    const baseCharsPerLine = Math.floor(screenWidth / (15 * fontScale));
    return baseCharsPerLine * 2;
  }, [screenWidth]);

  const truncateText = useMemo(
    () => (text: string) => {
      if (!text || text.length <= calculateMaxChars) return text;
      const truncated = text.slice(0, calculateMaxChars);
      const lastSentence = truncated.match(/[^.!?]*[.!?]+/g);

      let result: string;
      if (lastSentence?.length) {
        result = truncated.slice(
          0,
          truncated.lastIndexOf(lastSentence[lastSentence.length - 1]) + 1,
        );
      } else {
        const lastSpace = truncated.lastIndexOf(" ");
        result = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
      }

      return `${result.trim()}...`;
    },
    [calculateMaxChars],
  );

  return { truncateText, calculateMaxChars };
};
