'use server';

/**
 * @fileOverview An AI agent that generates an image from a prompt.
 *
 * - generateImage - A function that handles the image generation process.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImageWithReplicate(prompt: string): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not set');
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: {
        prompt: prompt,
        width: 700,
        height: 980,
      },
    }),
  });

  if (response.status !== 201) {
    const error = await response.json();
    throw new Error(`Failed to create prediction: ${JSON.stringify(error)}`);
  }

  let prediction = await response.json();

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    await sleep(1500); // Slightly increased polling delay
    const pollResponse = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    prediction = await pollResponse.json();
  }

  if (prediction.status === 'failed') {
    throw new Error(`Prediction failed: ${JSON.stringify(prediction.error)}`);
  }

  if (!prediction.output || prediction.output.length === 0) {
    throw new Error('Prediction did not return an image.');
  }

  return prediction.output[0];
}


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({ prompt }) => {
    const imageUrl = await generateImageWithReplicate(prompt);
    return { imageUrl };
  }
);
