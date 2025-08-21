'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateImage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImageDisplayCard } from '@/components/image-display-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2" />
          Generate
        </>
      )}
    </Button>
  );
}

function GenerationResult({ state }: { state: any }) {
    const { pending } = useFormStatus();

    return (
        <div className="w-full">
            {pending && (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {state.error && !pending && (
                <Alert variant="destructive">
                    <AlertTitle>Generation Failed</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}

            {state.data && !pending && (
                <ImageDisplayCard
                    imageUrl={state.data.imageUrl}
                    enhancedPrompt={state.data.enhancedPrompt}
                    hint={state.data.hint}
                />
            )}
        </div>
    );
}

export default function Home() {
  const [state, formAction] = useFormState(generateImage, {});

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-12 md:p-8">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">ProximAI</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Transform your ideas into stunning visuals. Start with a simple concept, and let our AI create a detailed masterpiece for you.
          </p>
        </header>
        
        <form action={formAction} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Create your masterpiece
                </CardTitle>
                <CardDescription>
                  Enter a basic prompt. Our AI will enhance it for optimal image generation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Textarea
                        name="basicPrompt"
                        placeholder="e.g., A majestic lion wearing a crown in a futuristic city"
                        className="min-h-[100px] resize-none"
                        required
                        key={state.data ? Date.now() : 'prompt-area'}
                    />
                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                </div>
              </CardContent>
            </Card>

            <GenerationResult state={state} />
        </form>
      </div>
    </main>
  );
}
