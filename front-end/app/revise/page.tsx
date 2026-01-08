'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, BrainCircuit, RotateCw, CheckCircle, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
// import { generateRevisionContent } from '@/lib/api'; // DISABLED FOR DEMO

interface Flashcard {
    front: string;
    back: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct: string;
    explanation: string;
}

interface RevisionResult {
    flashcards: Flashcard[];
    quiz: QuizQuestion[];
}

export default function RevisePage() {
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [weakness, setWeakness] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Removed local results state - redirecting to /revise/results instead


    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // 50MB Limit Check (50 * 1024 * 1024 bytes)
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError("File is too large. Max limit is 50MB.");
                return;
            }

            setFile(selectedFile);

            // Only create image preview if it's an image
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null); // Clear preview for non-images
            }
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!topic || !weakness || !file) return;

        setLoading(true);
        setError(null);

        // SIMULATE API CALL then REDIRECT
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s fake loading
            router.push('/revise/results');
        } catch (err: any) {
            console.error(err);
            setError('Failed to generate revision content.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold tracking-wide uppercase">
                        <RotateCw className="w-4 h-4" />
                        AI Revision Loop
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                        SMART <span className="text-purple-500">REVISION</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl">
                        Upload your notes or a problem image. AI will generate custom flashcards and a mini-quiz to fix your weak spots.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Inputs */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">

                            {/* Image Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-border hover:border-purple-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20"
                            >
                                {preview ? (
                                    <img src={preview} alt="Upload preview" className="max-h-48 rounded-lg shadow-md object-contain" />
                                ) : file ? (
                                    <div className="text-center space-y-3 text-muted-foreground">
                                        <div className="bg-green-100 p-3 rounded-full inline-block shadow-sm">
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">{file.name}</p>
                                            <p className="text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-3 text-muted-foreground">
                                        <div className="bg-background p-3 rounded-full inline-block shadow-sm">
                                            <UploadCloud className="w-8 h-8 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground">Click to Upload Class Notes</p>
                                            <p className="text-xs">PDF, Image, or Text (Max 50MB)</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,image/*,.txt"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Text Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Topic</label>
                                    <Input
                                        placeholder="e.g. Thermodynamics, Linear Algebra"
                                        value={topic}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">My Weakness / Confusion</label>
                                    <Input
                                        placeholder="e.g. Setting up the integral, entropy vs enthalpy"
                                        value={weakness}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeakness(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !topic || !weakness || !file}
                                className="w-full py-6 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generating Kit...
                                    </>
                                ) : (
                                    <>
                                        Generate content <BrainCircuit className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Results - REMOVED (Moved to new page) */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="p-8 border-2 border-dashed border-border rounded-3xl bg-card/30 max-w-md">
                            <RotateCw className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-pulse" />
                            <h3 className="text-xl font-bold">Ready to Learn?</h3>
                            <p className="text-muted-foreground mt-2">
                                Upload your content on the left to generate your personalized AI study kit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// FlashcardItem component moved/removed or kept if redirect logic didn't need it. 
// Since we removed the usage above, we can delete the function here to clean up, 
// OR leave it if we plan to revert. For now, deleting to keep file clean as per instruction.

