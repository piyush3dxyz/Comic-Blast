'use client';

import { useActionState, useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Download, FileText, Paintbrush, MessageSquareQuote, PanelTop, Star, LayoutGrid } from 'lucide-react';
import { generateComic } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function StarburstIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} stroke="black" strokeWidth="3">
            <path fill="hsl(var(--primary))" d="M 50,0 L 61.2,35.5 L 98.2,35.5 L 68.5,58.7 L 79.7,94.2 L 50,71 L 20.3,94.2 L 31.5,58.7 L 1.8,35.5 L 38.8,35.5 Z" />
        </svg>
    )
}

const loadingWords = ["POW!", "BAM!", "CRACK!", "WHOOSH!", "KABOOM!"];

function LoadingState() {
    const [word, setWord] = useState(loadingWords[0]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIndex(prevIndex => (prevIndex + 1) % loadingWords.length);
        }, 500);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setWord(loadingWords[index]);
    }, [index]);

    return (
        <div className="flex flex-col items-center justify-center gap-8 p-8">
            <div className="relative flex items-center justify-center w-64 h-64">
                <StarburstIcon className="absolute w-full h-full text-destructive animate-spin-slow fill-red-600" />
                <StarburstIcon className="absolute w-3/4 h-3/4 text-primary animate-ping fill-yellow-400" />
                <h2 className="z-10 text-5xl font-headline text-white loading-burst-text" style={{ textShadow: '3px 3px 0px #000' }}>
                    {word}
                </h2>
            </div>
            <p className="text-2xl font-bold text-white font-body" style={{ textShadow: '2px 2px 0px #000' }}>Conjuring your comic...</p>
        </div>
    );
}


function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} size="lg" className="w-full text-2xl font-headline py-8 px-10 border-4 border-black !bg-primary hover:!bg-yellow-400 !text-black shadow-[8px_8px_0px_#000000] hover:shadow-[10px_10px_0px_#000000] transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
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

function GenerationResult({ state }: { state: any }) {
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
                
                const a4Ratio = 297/210;
                
                let finalWidth, finalHeight;
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
            <div className="space-y-12 animate-in fade-in-50 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-destructive border-4 border-black rounded-lg -rotate-1 shadow-[8px_8px_0px_#000000] animate-in slide-in-from-top-10 duration-500">
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
                         <div key={index} className="space-y-4 animate-in fade-in-50 duration-500" style={{animationDelay: `${index * 150}ms`}}>
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

const PanelLayoutOption = ({ value, label, panels }: { value: string, label: string, panels: number }) => (
    <div>
        <RadioGroupItem value={value} id={`layout-${value}`} className="sr-only" />
        <Label
            htmlFor={`layout-${value}`}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-4 border-black p-4 cursor-pointer transition-all bg-secondary hover:bg-black/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-destructive data-[state=checked]:shadow-[4px_4px_0px_#ef4444]"
        >
            <div className={`grid grid-cols-2 gap-1 w-12 h-10`}>
                {[...Array(panels)].map((_, i) => (
                    <div key={i} className="bg-white/80 rounded-sm" />
                ))}
            </div>
            <span className="font-bold text-lg">{label}</span>
        </Label>
    </div>
);


export default function Home() {
  const [state, formAction, isPending] = useActionState(generateComic, { data: undefined, error: undefined });
  
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 py-12 md:p-8">
      <div className="w-full max-w-4xl space-y-16">
        <header className="text-center space-y-4">
            <div className="relative inline-block">
                 <StarburstIcon className="w-48 h-48 text-primary" />
                 <h1 className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl font-headline text-white transform -rotate-6" style={{ textShadow: '4px 4px 0px #000' }}>
                    Comic Blast!
                 </h1>
            </div>
          <p className="text-2xl text-white font-bold font-body" style={{ textShadow: '2px 2px 0px #000' }}>
            Turn your imagination into a comic book — instantly!
          </p>
        </header>
        
        <form action={formAction} className="space-y-8" key={state.data ? Date.now() : 'form'}>
            <Card className="!bg-secondary border-4 border-black shadow-[10px_10px_0px_rgba(0,0,0,1)]">
              <div className="bg-primary border-b-4 border-black p-2 rounded-t-sm">
                  <h2 className="text-3xl font-headline text-primary-foreground flex items-center justify-center gap-2">
                     <MessageSquareQuote /> Your Super Story
                  </h2>
              </div>
              <CardContent className="p-6 space-y-8">
                <Textarea
                    id="story"
                    name="story"
                    placeholder="e.g., A brave knight with a silver helmet and a blue cape travels to a dark castle..."
                    className="min-h-[150px] resize-y bg-slate-100 text-black text-lg font-bold placeholder:text-black/50 border-4 border-black focus-visible:ring-accent"
                    required
                />
                 
                 <div className="space-y-4">
                     <h3 className="text-3xl font-headline text-primary flex items-center justify-center gap-2">
                         <LayoutGrid /> Panel Layout
                     </h3>
                     <RadioGroup name="numPanels" defaultValue="4" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <PanelLayoutOption value="2" label="2 Panels" panels={2} />
                        <PanelLayoutOption value="4" label="4 Panels" panels={4} />
                        <PanelLayoutOption value="6" label="6 Panels" panels={6} />
                        <PanelLayoutOption value="8" label="8 Panels" panels={8} />
                     </RadioGroup>
                 </div>
                 <div className="flex justify-center pt-4">
                    <SubmitButton isPending={isPending} />
                </div>
              </CardContent>
            </Card>
        </form>
         <div className="mt-16 min-h-[400px] flex items-center justify-center">
            {isPending ? <LoadingState /> : <GenerationResult state={state} />}
        </div>
      </div>
    </main>
  );
}
