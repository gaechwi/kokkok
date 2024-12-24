import * as ImageManipulator from "expo-image-manipulator";

/**
 * Optimize an image by resizing to a maximum dimension of 720 and converting to WebP format
 * @param uri string - The URI of the image
 * @param maxDimension number - Maximum width or height for resizing
 * @param quality number - Quality (0-1) for WebP compression
 * @returns Promise<string> - Optimized image URI
 */
const optimizeImage = async (
  uri: string,
  maxDimension = 520,
): Promise<string> => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: { width: maxDimension, height: maxDimension },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.WEBP,
      },
    );
    return manipulatedImage.uri;
  } catch (error) {
    console.error("Error optimizing image:", error);
    throw error;
  }
};

export default optimizeImage;
