'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, AlertCircle, Loader2, Timer, Hash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import type { TestSession } from '@/lib/questions';

const TIME_OPTIONS = [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '15 min', value: 15 },
    { label: '20 min', value: 20 },
    { label: '30 min', value: 30 },
    { label: 'No Limit', value: null },
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

export default function TestsPage() {
    const router = useRouter();
    const { user } = useUser();
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [timeLimit, setTimeLimit] = useState<number | null>(10);
    const [numQuestions, setNumQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartTest = async () => {
        if (!topic || !level || !syllabus) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id ?? 'anonymous',
                    topic,
                    level,
                    syllabus,
                    numQuestions,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.error || 'Generation failed');
            }

            const questions = await res.json();

            const session: TestSession = {
                questions,
                topic,
                level,
                syllabus,
                startedAt: new Date().toISOString(),
                timeLimitMinutes: timeLimit,
            };

            sessionStorage.setItem('testSession', JSON.stringify(session));
            router.push('/tests/take');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500">

            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-serif font-bold tracking-wide">Test Center</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-10 space-y-16">

                {/* New Test Configuration */}
                <section className="relative overflow-hidden rounded-3xl bg-black dark:bg-white text-white dark:text-black p-8 md:p-12 shadow-2xl">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-blue-500/30 blur-[60px]" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-purple-500/30 blur-[60px]" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                                Ready to challenge yourself?
                            </h2>
                            <p className="text-white/70 dark:text-black/70 text-lg max-w-md">
                                Generate a custom AI-powered diagnostic test targeting your weak concepts. We'll track your precision and identify gaps.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/10 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Precise Timing</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/10 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Conceptual Gaps</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 dark:bg-black/5 backdrop-blur-xl border border-white/20 dark:border-black/10 rounded-2xl p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80">Topic</label>
                                <Input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Calculus, Organic Chemistry"
                                    className="bg-white/20 dark:bg-black/10 border-white/20 dark:border-black/10 text-white dark:text-black placeholder:text-white/50 dark:placeholder:text-black/40 focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80">Level</label>
                                <Input
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    placeholder="e.g. Undergraduate, JEE Advanced"
                                    className="bg-white/20 dark:bg-black/10 border-white/20 dark:border-black/10 text-white dark:text-black placeholder:text-white/50 dark:placeholder:text-black/40 focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80">Syllabus / Scope</label>
                                <Input
                                    value={syllabus}
                                    onChange={(e) => setSyllabus(e.target.value)}
                                    placeholder="e.g. Limits, Derivatives, Integrals"
                                    className="bg-white/20 dark:bg-black/10 border-white/20 dark:border-black/10 text-white dark:text-black placeholder:text-white/50 dark:placeholder:text-black/40 focus-visible:ring-blue-500"
                                />
                            </div>

                            {/* Question Count Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80 flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    Questions
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {QUESTION_COUNT_OPTIONS.map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => setNumQuestions(count)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${numQuestions === count
                                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                                    : 'bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 border border-white/10 dark:border-black/10'
                                                }`}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Limit Selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80 flex items-center gap-2">
                                    <Timer className="w-4 h-4" />
                                    Time Limit
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TIME_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => setTimeLimit(opt.value)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeLimit === opt.value
                                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                                    : 'bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 border border-white/10 dark:border-black/10'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleStartTest}
                                disabled={loading || !topic || !level || !syllabus}
                                className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900 shadow-lg transition-transform active:scale-95"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating {numQuestions} Questions...
                                    </span>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        Start Test
                                    </>
                                )}
                            </Button>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 bg-red-500/20 text-red-200 dark:text-red-800 text-sm rounded-xl text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
