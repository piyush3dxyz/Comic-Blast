'use server';

import { enhancePrompt } from '@/ai/flows/enhance-prompt';
import { generateImage as generateImageFlow } from '@/ai/flows/generate-image-flow';
import { z } from 'zod';

const formSchema = z.object({
  basicPrompt: z.string().min(3, 'Prompt must be at least 3 characters long.'),
});

type GenerationResult = {
  enhancedPrompt: string;
  imageUrl: string;
  hint: string;
};

type FormState = {
  error?: string;
  data?: GenerationResult;
};

export async function generateImage(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    basicPrompt: formData.get('basicPrompt'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.basicPrompt?.join(', '),
    };
  }
  
  const { basicPrompt } = validatedFields.data;

  try {
    const { enhancedPrompt } = await enhancePrompt({ basicPrompt });
    const { imageUrl } = await generateImageFlow({ prompt: enhancedPrompt });

    const hint = basicPrompt.split(' ').slice(0, 2).join(' ');

    return {
      data: {
        enhancedPrompt,
        imageUrl,
        hint,
      },
    };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred. Please try again.' };
  }
}
