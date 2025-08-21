'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Sparkles, Loader2, BookImage } from 'lucide-react';
import { generateComic } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          Generating Comic...
        </>
      ) : (
        <>
          <Sparkles className="mr-2" />
          Generate Comic
        </>
      )}
    </Button>
  );
}

function GenerationResult({ state }: { state: any }) {
    const { pending } = useFormStatus();

    if (pending) {
        return (
            <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                             <Skeleton className="aspect-video w-full rounded-lg" />
                             <Skeleton className="h-5 mt-4 w-full" />
                             <Skeleton className="h-5 mt-2 w-4/5" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (state.error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )
    }

    if (state.data?.panels) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center">Your Comic Book</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.data.panels.map((panel: any, index: number) => (
                         <Card key={index} className="overflow-hidden animate-in fade-in-50 duration-500">
                            <CardContent className="p-4 space-y-4">
                                <div className="aspect-video w-full overflow-hidden rounded-md border shadow-lg">
                                    <Image
                                        src={panel.imageUrl}
                                        alt={panel.imagePrompt}
                                        width={512}
                                        height={288}
                                        className="h-full w-full object-cover transition-transform hover:scale-105"
                                        priority={true}
                                    />
                                </div>
                                <blockquote className="border-l-2 border-primary pl-4 italic text-foreground text-sm">
                                    {panel.text}
                                </blockquote>
                            </CardContent>
                         </Card>
                    ))}
                </div>
            </div>
        )
    }

    return null;
}


export default function Home() {
  const [state, formAction] = useActionState(generateComic, {});

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-12 md:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl flex items-center justify-center gap-3">
            <BookImage className="size-10" />
            Comic Ebook Creator
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Turn your story into a beautiful comic book. Write your script, and let AI do the drawing.
          </p>
        </header>
        
        <form action={formAction} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" />
                  Enter Your Story
                </CardTitle>
                <CardDescription>
                  Provide a script or story below. The AI will break it down into panels and generate images.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Textarea
                        name="story"
                        placeholder="e.g., A brave knight travels to a dark castle. In the throne room, he confronts a fearsome dragon."
                        className="min-h-[150px] resize-y"
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
