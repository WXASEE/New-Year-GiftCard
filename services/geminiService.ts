import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import type { Category } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const generateProductImages = async (
  category: Category,
  formData: Record<string, string | File>
): Promise<string[]> => {
  
  const imageFile = formData.productImage as File;
  if (!imageFile) {
    throw new Error("Image file is missing.");
  }
  
  const backgroundRefFile = formData.backgroundReferenceImage as File;
  const modelFile = formData.modelImage as File;
  const clothingFile = formData.clothingImage as File;
  const consistencyFile = formData.consistencyReferenceImage as File;

  const imagePart = await fileToGenerativePart(imageFile);
  
  // Pass all form data to the template, including files for conditional logic
  const prompt = category.promptTemplate(formData as Record<string, string>);
  console.log("Generated Prompt:", prompt);
  
  const parts: Part[] = [imagePart];
  
  if (backgroundRefFile) {
      const backgroundPart = await fileToGenerativePart(backgroundRefFile);
      parts.push(backgroundPart);
  }
  
  if (modelFile) {
      const modelPart = await fileToGenerativePart(modelFile);
      parts.push(modelPart);
  }

  if (clothingFile) {
      const clothingPart = await fileToGenerativePart(clothingFile);
      parts.push(clothingPart);
  }
  
  if (consistencyFile) {
      const consistencyPart = await fileToGenerativePart(consistencyFile);
      parts.push(consistencyPart);
  }

  parts.push({ text: prompt });

  const contents = { parts };

  const generateSingleImage = async (): Promise<string> => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: contents,
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    // Check for safety ratings and provide a more informative error
    const candidate = response.candidates[0];
    if (candidate.finishReason !== 'STOP' && candidate.safetyRatings) {
      const blockedRating = candidate.safetyRatings.find(rating => rating.blocked);
      if (blockedRating) {
        console.warn('Image generation blocked due to safety settings. Category:', blockedRating.category);
        throw new Error(`Image generation was blocked due to safety settings (Reason: ${blockedRating.category}). Please try a different image or prompt.`);
      }
    }
    throw new Error("The API did not return an image. The model may have refused the request.");
  };

  try {
    const imagePromises = [generateSingleImage(), generateSingleImage(), generateSingleImage()];
    const images = await Promise.all(imagePromises);
    
    if (images.length === 0) {
      throw new Error("The API did not return any images.");
    }
    
    return images;

  } catch (error) {
    console.error("Error generating images with Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to generate images due to an unknown error. Please check the console.");
  }
};