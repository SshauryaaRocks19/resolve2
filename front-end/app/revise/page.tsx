'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, BrainCircuit, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RevisePage() {
    const router = useRouter();
    const [topic, setTopic] = useState('');
    const [weakness, setWeakness] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 50 * 1024 * 1024) {
                setError("File is too large. Max limit is 50MB.");
                return;
            }
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                setPreview(URL.createObjectURL(selectedFile));
            } else {
                setPreview(null);
            }
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!topic || !weakness) return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('topic', topic);
            formData.append('weakness', weakness);
            if (file) {
                formData.append('file', file);
            }

            const response = await fetch('http://localhost:8000/revision-tool', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed: ${errorText}`);
            }

            const data = await response.json();
            // Store in sessionStorage so results page can read it
            sessionStorage.setItem('revisionData', JSON.stringify(data));
            router.push('/revise/results');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate revision content. Is the API server running?');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="max-w-4xl w-full relative z-10 space-y-12 py-12">

                {/* Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-widest uppercase border border-blue-200 dark:border-blue-500/30"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        Smart Revision Planning
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                    >
                        Revision <br className="md:hidden" /> Planning
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Upload your fragmented notes. Our AI will restructure them into a
                        <span className="text-black dark:text-white font-medium"> coherent study plan</span>, identifying gaps you didn't know you had.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl space-y-8"
                >
                    {/* File Upload Zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file
                            ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10'
                            : 'border-black/10 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                            }`}
                    >
                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Upload preview" className="max-h-64 rounded-xl shadow-lg object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-sans font-bold">Change Image</span>
                                </div>
                            </div>
                        ) : file ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{file.name}</p>
                                    <p className="text-sm opacity-60 font-sans">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="font-serif font-bold text-xl">Drop class notes or problem set</p>
                                    <p className="text-sm opacity-50 mt-1 font-sans">PDF, Image, or Text</p>
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

                    {/* Inputs Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Target Subject</label>
                            <Input
                                placeholder="e.g. Multivariable Calculus"
                                value={topic}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
                                className="h-12 bg-white/50 dark:bg-black/20 border-black/10 dark:border-white/10 font-serif text-lg focus-visible:ring-blue-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Specific Weak Point</label>
                            <Input
                                placeholder="e.g. The Jacobian Matrix concept"
                                value={weakness}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeakness(e.target.value)}
                                className="h-12 bg-white/50 dark:bg-black/20 border-black/10 dark:border-white/10 font-serif text-lg focus-visible:ring-blue-500/50"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !topic || !weakness}
                        className="w-full h-16 text-lg font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-[1.01] shadow-xl font-sans"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing Content...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Generate Revision Plan <BrainCircuit className="w-5 h-5" />
                            </span>
                        )}
                    </Button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl font-sans text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
