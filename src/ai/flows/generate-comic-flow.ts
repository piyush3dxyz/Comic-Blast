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
});
export type GenerateComicPanelsInput = z.infer<typeof GenerateComicPanelsInputSchema>;


const ComicPanelSchema = z.object({
    imagePrompt: z.string().describe("A detailed, vibrant prompt for an image generation model to create the visual for this panel. This should be a single scene description."),
    text: z.string().describe("The narration or dialogue text that will be displayed in this panel."),
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
For each panel, you must provide a detailed visual prompt for an AI image generator, and the narration or dialogue for that panel.
Do not create more than 4 panels.

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
