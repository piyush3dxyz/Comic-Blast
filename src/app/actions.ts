'use server';

import { generateComicPanels } from '@/ai/flows/generate-comic-flow';
import { generateImage as generateImageFlow } from '@/ai/flows/generate-image-flow';
import { z } from 'zod';

const formSchema = z.object({
  story: z.string().min(10, 'Story must be at least 10 characters long.'),
});

type ComicPanel = {
    imagePrompt: string;
    text: string;
    imageUrl?: string;
};

type GenerationResult = {
  panels: ComicPanel[];
};

type FormState = {
  error?: string;
  data?: GenerationResult;
};

export async function generateComic(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    story: formData.get('story'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.story?.join(', '),
    };
  }
  
  const { story } = validatedFields.data;

  try {
    const { panels } = await generateComicPanels({ story });

    if (!panels || panels.length === 0) {
        return { error: "The AI could not generate any comic panels from the story. Please try a different story." };
    }
    
    // Generate an image for each panel in parallel
    const imagePromises = panels.map(panel => 
        generateImageFlow({ prompt: `${panel.imagePrompt}, comic book style` })
    );
    const imageResults = await Promise.all(imagePromises);

    const populatedPanels = panels.map((panel, index) => ({
        ...panel,
        imageUrl: imageResults[index].imageUrl,
    }));

    return {
      data: {
        panels: populatedPanels,
      },
    };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred. Please try again.' };
  }
}
