'use server';

/**
 * @fileOverview An AI agent that turns a story into a series of comic book panels.
 *
 * - generateComicPanels - A function that handles the comic panel generation process.
 * - GenerateComicPanelsInput - The input type for the function.
 * - GenerateComicPanelsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateComicPanelsInputSchema = z.object({
  story: z.string().describe('The story to be turned into a comic book.'),
  numPanels: z.number().min(1).max(25).describe('The number of comic panels to generate.'),
});
export type GenerateComicPanelsInput = z.infer<typeof GenerateComicPanelsInputSchema>;


const ComicPanelSchema = z.object({
    imagePrompt: z.string().describe("A detailed, vibrant prompt for an image generation model to create ONLY the visual for this panel. This prompt should describe a single, dynamic scene without any text, letters, or words in it."),
    text: z.string().describe("The narration or dialogue text that will be displayed separately over the image for this panel."),
});

const GenerateComicPanelsOutputSchema = z.object({
  panels: z.array(ComicPanelSchema).describe('An array of comic book panels.'),
});
export type GenerateComicPanelsOutput = z.infer<typeof GenerateComicPanelsOutputSchema>;

export async function generateComicPanels(input: GenerateComicPanelsInput): Promise<GenerateComicPanelsOutput> {
  return generateComicPanelsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateComicPanelsPrompt',
  input: {schema: GenerateComicPanelsInputSchema},
  output: {schema: GenerateComicPanelsOutputSchema},
  prompt: `You are a comic book author. Your task is to take a story and break it down into a series of distinct panels with a consistent style.

First, define a consistent art style for the entire comic. For example: "vibrant comic book art, cel-shaded, simple backgrounds".
Second, create a detailed "character sheet" for any main characters to ensure visual consistency. Describe their appearance, clothing, and key features.

Then, for each panel, you must provide two things:
1.  A visual prompt for an AI image generator. This prompt MUST adhere to the defined art style and character sheets. Keep the scene simple, focusing only on the essential characters and action to maintain consistency. The prompt MUST NOT contain any text, words, or letters.
2.  The separate narration or dialogue text for that panel.

Create exactly {{{numPanels}}} panels.

Story: {{{story}}}
`,
});

const generateComicPanelsFlow = ai.defineFlow(
  {
    name: 'generateComicPanelsFlow',
    inputSchema: GenerateComicPanelsInputSchema,
    outputSchema: GenerateComicPanelsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
