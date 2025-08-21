'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Sparkles, Loader2, BookImage, Download } from 'lucide-react';
import { generateComic } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

function GenerationResult({ state, numPanelsToGenerate }: { state: any, numPanelsToGenerate: number }) {
    const { pending } = useFormStatus();
    const [selectedPanels, setSelectedPanels] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    const handlePanelSelection = (index: number, checked: boolean) => {
        const newSelection = new Set(selectedPanels);
        if (checked) {
            newSelection.add(index);
        } else {
            newSelection.delete(index);
        }
        setSelectedPanels(newSelection);
    };

    const handleExportPdf = async () => {
        if (selectedPanels.size === 0) {
            alert("Please select at least one panel to export.");
            return;
        }
        setIsExporting(true);
        
        const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
        const sortedSelectedPanels = Array.from(selectedPanels).sort((a,b) => a - b);
        
        for (let i = 0; i < sortedSelectedPanels.length; i++) {
            const panelIndex = sortedSelectedPanels[i];
            const panelElement = document.getElementById(`comic-panel-${panelIndex}`);
            if (panelElement) {
                if (i > 0) {
                    doc.addPage('l', 'mm', 'a4');
                }
                const canvas = await html2canvas(panelElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null, // Transparent background for canvas
                });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const canvasRatio = canvasWidth / canvasHeight;
                
                let finalWidth, finalHeight;
                // Fit to width
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / canvasRatio;
                
                let y = (pdfHeight - finalHeight) / 2;
                if (y < 0) y = 0;


                doc.addImage(imgData, 'PNG', 0, y, finalWidth, finalHeight);
            }
        }
        
        doc.save('comic-ebook.pdf');
        setIsExporting(false);
    };
    
    if (pending) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(numPanelsToGenerate)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 space-y-4">
                                 <Skeleton className="aspect-video w-full rounded-lg" />
                                 <Skeleton className="h-5 w-full" />
                                 <Skeleton className="h-5 w-4/5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-center">Your Comic Book</h2>
                    <Button onClick={handleExportPdf} disabled={isExporting || selectedPanels.size === 0}>
                        {isExporting ? (
                             <Loader2 className="mr-2 animate-spin" />
                        ) : (
                             <Download className="mr-2" />
                        )}
                        Export Selected as PDF
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.data.panels.map((panel: any, index: number) => (
                         <div key={index} className="space-y-2 animate-in fade-in-50 duration-500">
                             <Card id={`comic-panel-${index}`} className="overflow-hidden bg-card">
                                <CardContent className="p-0 space-y-0 relative">
                                    <div className="aspect-video w-full overflow-hidden">
                                        <Image
                                            src={panel.imageUrl}
                                            alt={panel.imagePrompt}
                                            width={512}
                                            height={288}
                                            className="h-full w-full object-cover"
                                            priority={true}
                                        />
                                    </div>
                                    <blockquote className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 text-white text-sm backdrop-blur-sm border-t border-white/20">
                                        {panel.text}
                                    </blockquote>
                                </CardContent>
                             </Card>
                            <div className="flex items-center space-x-2 px-1">
                                <Checkbox 
                                    id={`select-panel-${index}`}
                                    onCheckedChange={(checked) => handlePanelSelection(index, !!checked)}
                                />
                                <Label htmlFor={`select-panel-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Select Panel {index + 1}
                                </Label>
                            </div>
                         </div>
                    ))}
                </div>
            </div>
        )
    }

    return null;
}


export default function Home() {
  const [state, formAction] = useActionState(generateComic, {});
  const [numPanels, setNumPanels] = useState(4);
  const [numPanelsToGenerate, setNumPanelsToGenerate] = useState(4);
  const formRef = useRef<HTMLFormElement>(null);


  const handleFormAction = (formData: FormData) => {
    // Before calling the action, we capture the number of panels
    // that are *about* to be generated.
    const panels = parseInt(formData.get('numPanels') as string, 10);
    setNumPanelsToGenerate(panels);
    formAction(formData);
  };


  useEffect(() => {
    // Reset form fields if the submission was successful
    if (state.data && !state.error) {
        if (formRef.current) {
            formRef.current.reset();
        }
        // Also reset the controlled component state if you have any
        setNumPanels(4);
    }
  }, [state]);


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
        
        <form ref={formRef} action={handleFormAction} className="space-y-8" key={state.data ? Date.now() : 'form'}>
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
                    />
                     <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numPanels">Number of Panels</Label>
                             <Select name="numPanels" value={String(numPanels)} onValueChange={(val) => setNumPanels(parseInt(val))}>
                                <SelectTrigger id="numPanels">
                                    <SelectValue placeholder="Select number of panels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                </div>
              </CardContent>
            </Card>

            <GenerationResult state={state} numPanelsToGenerate={numPanelsToGenerate} />
        </form>
      </div>
    </main>
  );
}
