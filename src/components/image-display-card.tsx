'use client';

import Image from 'next/image';
import { Download, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ImageDisplayCardProps = {
  imageUrl: string;
  enhancedPrompt: string;
  hint: string;
};

export function ImageDisplayCard({ imageUrl, enhancedPrompt, hint }: ImageDisplayCardProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: 'Copied to clipboard!',
        description: 'Image URL is ready to be shared.',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy URL to clipboard. Please try again.',
      });
    }
  };

  return (
    <Card className="overflow-hidden animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Your AI-Generated Image</CardTitle>
        <CardDescription>
          This is the visual interpretation of the AI-enhanced prompt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg">
          <Image
            src={imageUrl}
            alt={enhancedPrompt}
            width={1024}
            height={1024}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            data-ai-hint={hint}
            priority
          />
        </div>

        <div className="space-y-3 rounded-md bg-secondary/50 p-4">
            <h3 className="text-sm font-semibold text-muted-foreground">ENHANCED PROMPT</h3>
            <blockquote className="border-l-2 border-primary pl-4 italic text-foreground">
                {enhancedPrompt}
            </blockquote>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 bg-card sm:flex-row sm:justify-end p-4">
        <Button asChild variant="outline">
          <a href={imageUrl} download={`proximai-image.png`} target="_blank">
            <Download className="mr-2" />
            Download
          </a>
        </Button>
        <Button onClick={handleShare}>
          <Copy className="mr-2" />
          Copy Link
        </Button>
      </CardFooter>
    </Card>
  );
}
