'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, BookImage, Download, FileText, Image as ImageIcon } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
      {isPending ? (
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

function GenerationResult({ state, isPending, numPanelsToGenerate }: { state: any, isPending: boolean, numPanelsToGenerate: number }) {
    const [selectedPanels, setSelectedPanels] = useState<Set<number>>(new Set());
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if(state.data) {
            // Select all panels by default when new results come in
            const allPanels = new Set(Array.from(Array(state.data.panels.length).keys()));
            setSelectedPanels(allPanels);
        }
    },[state.data])

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
        
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        const sortedSelectedPanels = Array.from(selectedPanels).sort((a,b) => a - b);
        
        for (let i = 0; i < sortedSelectedPanels.length; i++) {
            const panelIndex = sortedSelectedPanels[i];
            const panelElement = document.getElementById(`comic-panel-${panelIndex}`);

            if (panelElement) {
                if (i > 0) {
                    doc.addPage();
                }
                const canvas = await html2canvas(panelElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: null, 
                });
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const canvasRatio = canvasWidth / canvasHeight;

                let finalWidth = pdfWidth - 20; // with margin
                let finalHeight = finalWidth / canvasRatio;

                if (finalHeight > pdfHeight - 20) {
                    finalHeight = pdfHeight - 20; // with margin
                    finalWidth = finalHeight * canvasRatio;
                }
                
                const x = (pdfWidth - finalWidth) / 2;
                const y = (pdfHeight - finalHeight) / 2;

                doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            }
        }
        
        doc.save('comic-ebook.pdf');
        setIsExporting(false);
    };

    if (isPending) {
        return (
            <div className="space-y-8">
                {[...Array(numPanelsToGenerate)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <div className="grid md:grid-cols-2">
                           <div className="p-4 bg-muted/50 flex items-center justify-center">
                                <Skeleton className="aspect-[7/10] w-full max-w-[352px] rounded-lg" />
                           </div>
                           <div className="p-6 flex flex-col justify-center">
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                           </div>
                        </div>
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
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-card border rounded-lg">
                    <h2 className="text-2xl font-bold text-center">Your Comic Book</h2>
                    <Button onClick={handleExportPdf} disabled={isExporting || selectedPanels.size === 0}>
                        {isExporting ? (
                             <Loader2 className="mr-2 animate-spin" />
                        ) : (
                             <Download className="mr-2" />
                        )}
                        Export Selected as PDF ({selectedPanels.size})
                    </Button>
                </div>
                <div className="space-y-8">
                    {state.data.panels.map((panel: any, index: number) => (
                         <div key={index} className="space-y-2 animate-in fade-in-50 duration-500">
                            <Card id={`comic-panel-${index}`} className="overflow-hidden bg-black border-2 border-primary/20 shadow-lg shadow-primary/10">
                                <div className="grid md:grid-cols-2 items-stretch">
                                    <div className="p-4 bg-black flex items-center justify-center">
                                        <Image
                                            src={panel.imageUrl}
                                            alt={panel.imagePrompt}
                                            width={704}
                                            height={984}
                                            className="object-contain w-full h-full rounded-md shadow-2xl shadow-black"
                                            priority={true}
                                        />
                                    </div>
                                    <div className="p-8 md:p-12 flex flex-col justify-center bg-black">
                                        <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed font-serif">
                                            {panel.text}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                            <div className="flex items-center space-x-2 px-1">
                                <Checkbox 
                                    id={`select-panel-${index}`}
                                    checked={selectedPanels.has(index)}
                                    onCheckedChange={(checked) => handlePanelSelection(index, !!checked)}
                                />
                                <Label htmlFor={`select-panel-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Include Panel {index + 1} in Export
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
  const [state, formAction, isPending] = useActionState(generateComic, { data: null, error: undefined });
  const [numPanels, setNumPanels] = useState(4);
  const [numPanelsToGenerate, setNumPanelsToGenerate] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormAction = (formData: FormData) => {
    const panels = parseInt(formData.get('numPanels') as string, 10);
    setNumPanelsToGenerate(panels);
    formAction(formData);
  };
  
  useEffect(() => {
    if (state.data && !state.error && !isPending) {
        if (formRef.current) {
            formRef.current.reset();
        }
        setNumPanels(4);
    }
  }, [state, isPending]);

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-12 md:p-8">
      <div className="w-full max-w-5xl">
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
                  <FileText className="text-primary" />
                  Your Story
                </CardTitle>
                <CardDescription>
                  Provide a script or story. The AI will break it down into panels, generate images, and write narration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <Textarea
                        name="story"
                        placeholder="e.g., A brave knight with a silver helmet and a blue cape travels to a dark castle. In the throne room, he confronts a fearsome red dragon."
                        className="min-h-[150px] resize-y"
                        required
                    />
                     <Separator />
                     <div className="grid sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="numPanels">Number of Panels</Label>
                             <Select name="numPanels" value={String(numPanels)} onValueChange={(val) => setNumPanels(parseInt(val))}>
                                <SelectTrigger id="numPanels">
                                    <SelectValue placeholder="Select number of panels" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...Array(25)].map((_, i) => (
                                        <SelectItem key={i+1} value={String(i+1)}>{i+1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end">
                            <SubmitButton isPending={isPending} />
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
        </form>
         <div className="mt-8">
            <GenerationResult state={state} isPending={isPending} numPanelsToGenerate={numPanelsToGenerate} />
        </div>
      </div>
    </main>
  );
}
