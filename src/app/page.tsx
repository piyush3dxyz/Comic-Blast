'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Download, FileText, Paintbrush, MessageSquareQuote, PanelTop } from 'lucide-react';
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

function PowIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
            <path d="M14.29 3.71a2.43 2.43 0 0 0-2.66-.14l-4.57 2.1a2.43 2.43 0 0 0-1.22 2.14l-.62 5.02a2.43 2.43 0 0 0 1.54 2.54l4.47 2.05a2.43 2.43 0 0 0 2.66.14l4.57-2.1a2.43 2.43 0 0 0 1.22-2.14l.62-5.02a2.43 2.43 0 0 0-1.54-2.54z" />
            <path d="M6.06 9.61L9.5 7.5l2.44-1.11" />
            <path d="M9.5 7.5L11 12.5l-5.5 2.5" />
            <path d="M11 12.5l3.5 1.5 5-2.5" />
            <path d="m2.5 13.5 2 3" />
            <path d="M15.5 5.5l3 2" />
            <path d="M18.5 14.5l-2 3" />
        </svg>
    )
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto text-2xl font-headline py-8 px-10 border-4 border-black !bg-primary hover:!bg-yellow-400 !text-black shadow-[8px_8px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] transition-all duration-200 transform hover:-translate-y-1">
      {isPending ? (
        <>
          <Loader2 className="mr-4 animate-spin" />
          GENERATING...
        </>
      ) : (
        <>
          <Paintbrush className="mr-4" />
          GENERATE COMIC!
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
                
                // A4 aspect ratio
                const a4Ratio = 297/210;
                
                let finalWidth, finalHeight;
                // Check if image is landscape or portrait
                if(canvas.width > canvas.height){
                  finalWidth = pdfWidth - 20;
                  finalHeight = finalWidth * (canvas.height/canvas.width);
                } else {
                  finalHeight = pdfHeight - 20;
                  finalWidth = finalHeight * (canvas.width/canvas.height);
                }
                
                if (finalWidth > pdfWidth - 20) {
                    finalWidth = pdfWidth - 20;
                    finalHeight = finalWidth * (canvas.height/canvas.width);
                }

                if (finalHeight > pdfHeight - 20) {
                    finalHeight = pdfHeight - 20;
                    finalWidth = finalHeight * (canvas.width/canvas.height);
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
                   <div key={i} className="bg-black/80 border-4 border-black p-4 -rotate-2">
                         <div className="bg-white p-2">
                            <Skeleton className="aspect-[7/10] w-full max-w-[704px] rounded-none bg-slate-400" />
                         </div>
                   </div>
                ))}
            </div>
        )
    }

    if (state.error) {
        return (
            <Alert variant="destructive" className="border-4 border-black text-lg">
                <AlertTitle className="font-headline text-3xl">Generation Failed!</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )
    }

    if (state.data?.panels) {
        return (
            <div className="space-y-12">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-destructive border-4 border-black rounded-lg -rotate-1 shadow-[8px_8px_0px_#000000]">
                    <h2 className="text-3xl md:text-4xl font-headline text-white text-center" style={{ textShadow: '2px 2px 0px #000' }}>Your Comic is Ready!</h2>
                    <Button onClick={handleExportPdf} disabled={isExporting || selectedPanels.size === 0} className="!bg-accent hover:!bg-cyan-400 !text-black border-2 border-black">
                        {isExporting ? (
                             <Loader2 className="mr-2 animate-spin" />
                        ) : (
                             <Download className="mr-2" />
                        )}
                        Export Selected ({selectedPanels.size})
                    </Button>
                </div>
                <div className="space-y-16">
                    {state.data.panels.map((panel: any, index: number) => (
                         <div key={index} className="space-y-4 animate-in fade-in-50 duration-500">
                             <div id={`comic-panel-${index}`} className="bg-black border-4 border-black p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                                <div className="bg-white p-2 relative">
                                     <Image
                                        src={panel.imageUrl}
                                        alt={panel.imagePrompt}
                                        width={704}
                                        height={984}
                                        className="object-contain w-full h-full shadow-2xl shadow-black"
                                        priority={index < 2}
                                    />
                                    {panel.text && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 cursor-move speech-bubble-handle w-11/12">
                                            <div className="relative bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-xl shadow-lg speech-bubble max-w-full">
                                                <p className="text-center font-bold text-lg">{panel.text}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 px-1 justify-end">
                                <Checkbox 
                                    id={`select-panel-${index}`}
                                    checked={selectedPanels.has(index)}
                                    onCheckedChange={(checked) => handlePanelSelection(index, !!checked)}
                                    className="border-2 border-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <Label htmlFor={`select-panel-${index}`} className="text-lg font-bold font-body peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white" style={{ textShadow: '1px 1px 0px #000' }}>
                                    Panel {index + 1}
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
  const [state, formAction, isPending] = useActionState(generateComic, { data: undefined, error: undefined });
  const [numPanels, setNumPanels] = useState(4);
  const [numPanelsToGenerate, setNumPanelsToGenerate] = useState(0);

  const handleFormSubmit = (formData: FormData) => {
    const panels = parseInt(formData.get('numPanels') as string, 10);
    setNumPanelsToGenerate(panels);
    formAction(formData);
  };
  
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 py-12 md:p-8">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-12">
            <div className="inline-block bg-destructive p-4 border-4 border-black shadow-[10px_10px_0px_#000] -rotate-2 mb-4">
                 <h1 className="text-5xl sm:text-7xl font-headline text-white flex items-center justify-center gap-3 transform rotate-2" style={{ textShadow: '4px 4px 0px #000' }}>
                    <PowIcon />
                    Comic Creator
                 </h1>
            </div>
          <p className="mt-4 text-2xl text-white font-bold font-body" style={{ textShadow: '2px 2px 0px #000' }}>
            Turn your story into a beautiful comic book. Write your script, and let AI do the drawing!
          </p>
        </header>
        
        <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(new FormData(e.currentTarget)); }} className="space-y-8" key={state.data ? Date.now() : 'form'}>
            <Card className="!bg-transparent !border-none !shadow-none">
              <CardContent className="!p-0">
                <div className="space-y-6 bg-secondary p-6 border-4 border-black rounded-lg shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                    <div className="space-y-2">
                        <Label htmlFor="story" className="text-3xl font-headline text-primary flex items-center gap-2">
                           <MessageSquareQuote /> Your Super Story
                        </Label>
                        <Textarea
                            id="story"
                            name="story"
                            placeholder="e.g., A brave knight with a silver helmet and a blue cape travels to a dark castle..."
                            className="min-h-[150px] resize-y !bg-primary !text-black text-lg font-bold placeholder:!text-black/50 border-4 border-black focus-visible:ring-accent"
                            required
                        />
                    </div>
                     <Separator className="!bg-black/20 h-1" />
                     <div className="grid sm:grid-cols-2 gap-8 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="numPanels" className="text-3xl font-headline text-primary flex items-center gap-2">
                                <PanelTop /> Panel Count
                            </Label>
                             <Select name="numPanels" value={String(numPanels)} onValueChange={(val) => setNumPanels(parseInt(val))}>
                                <SelectTrigger id="numPanels" className="!bg-white/90 !text-black font-bold text-lg border-4 border-black focus:ring-accent">
                                    <SelectValue placeholder="Select number of panels" />
                                </SelectTrigger>
                                <SelectContent className="!bg-white !text-black font-bold border-2 border-black">
                                    {[...Array(12)].map((_, i) => (
                                        <SelectItem key={i+1} value={String(i+1)} className="font-bold focus:!bg-primary/80">{i+1}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                            <SubmitButton isPending={isPending} />
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
        </form>
         <div className="mt-16">
            <GenerationResult state={state} isPending={isPending} numPanelsToGenerate={numPanelsToGenerate} />
        </div>
      </div>
    </main>
  );
}
