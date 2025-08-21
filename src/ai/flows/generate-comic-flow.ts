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
  prompt: `You are a comic book author. Your task is to take a story and break it down into a series of distinct panels.
First, create a detailed "character sheet" for the main character(s) to ensure visual consistency. Describe their appearance, clothing, and key features.
Then, for each panel, you must provide two things:
1. A detailed visual prompt for an AI image generator. This prompt MUST reference the character sheet to ensure consistency and MUST NOT contain any text, words, or letters. It should only describe the visual elements of the scene.
2. The separate narration or dialogue for that panel.

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
