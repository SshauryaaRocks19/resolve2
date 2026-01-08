'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2,
    Sparkles,
    Target,
    ArrowRight,
    Layers,
    CheckCircle,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { prioritizeTopics } from '@/lib/api';
import Link from 'next/link';

// Interfaces matching the expected backend response
interface PrioritizedTopic {
    topic: string;
    priority_score: number;
    category: 'High Return' | 'Quick Win' | 'Core Concept' | 'Bonus' | 'Deprioritize';
    reasoning: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    avg_marks: number;
}

interface AnalysisResult {
    topics: PrioritizedTopic[];
    summary: {
        total_topics: number;
        high_yield_count: number;
        predicted_difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Nightmare';
    };
    strategy: {
        focus_areas: string[];
        quick_wins: string[];
    };
}

export default function PrioritizationPage() {
    const [syllabus, setSyllabus] = useState('');
    const [examName, setExamName] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        // if (!syllabus || !examName) return; // Allow empty for demo if needed, but keeping validation is fine

        setLoading(true);
        setError(null);

        // DISCONNECTED BACKEND: MOCK DATA SIMULATION
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Fake network delay

            const mockData: AnalysisResult = {
                topics: [
                    {
                        topic: "Lagrange Multipliers & Constrained Optimization",
                        priority_score: 95,
                        category: "High Return",
                        reasoning: "Critical optimization technique. consistently high-mark questions in IPU papers.",
                        difficulty: "Medium",
                        avg_marks: 12
                    },
                    {
                        topic: "Jacobian Matrix",
                        priority_score: 92,
                        category: "Core Concept",
                        reasoning: "Foundational for Unit 3 integration and change of variables. Must know.",
                        difficulty: "Medium",
                        avg_marks: 8
                    },
                    {
                        topic: "Optimizing Multivariable Functions",
                        priority_score: 88,
                        category: "High Return",
                        reasoning: "Major application area, questions often carry significant weight (10+ marks).",
                        difficulty: "Hard",
                        avg_marks: 10
                    },
                    {
                        topic: "Gradient & Directional Derivatives",
                        priority_score: 85,
                        category: "Quick Win",
                        reasoning: "Direct calculation questions. Easy marks if vector definitions are clear.",
                        difficulty: "Easy",
                        avg_marks: 6
                    },
                    {
                        topic: "Tangent Planes & Linearization",
                        priority_score: 75,
                        category: "Core Concept",
                        reasoning: "Standard application of partial derivatives. Often appears as part of larger problems.",
                        difficulty: "Medium",
                        avg_marks: 5
                    },
                    {
                        topic: "Curvature & Parametric Curves",
                        priority_score: 45,
                        category: "Deprioritize",
                        reasoning: "Formula-heavy but rarely tested in depth compared to gradient-based optimization.",
                        difficulty: "Hard",
                        avg_marks: 4
                    }
                ],
                summary: {
                    total_topics: 13,
                    high_yield_count: 3,
                    predicted_difficulty: "Moderate"
                },
                strategy: {
                    focus_areas: ["Optimization Word Problems", "Vector Calculus Fundamentals"],
                    quick_wins: ["Partial Derivatives Computation", "Gradient Vector Properties"]
                }
            };

            setResults(mockData);

        } catch (err: any) {
            setError('Simulation failed.');
        } finally {
            setLoading(false);
        }
    };

    if (results) {
        return <ResultsView results={results} onReset={() => setResults(null)} />
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <div className="max-w-4xl w-full relative z-10 space-y-12 py-12">

                {/* Header */}
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold tracking-widest uppercase border border-blue-200 dark:border-blue-500/30"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Strategic Analysis
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                    >
                        Strategic <br className="md:hidden" /> Prioritization
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Don't study everything. Study <span className="text-black dark:text-white font-medium">optimally</span>.
                        Our engine predicts high-yield topics based on exam patterns.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl space-y-8"
                >
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Exam Context</label>
                            <Input
                                placeholder="e.g. JEE Advanced, CS229 Final"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                className="h-14 bg-white/50 dark:bg-black/20 border-black/10 dark:border-white/10 font-serif text-xl focus-visible:ring-blue-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Syllabus / Topics List</label>
                            <Textarea
                                placeholder="Paste your syllabus topics here..."
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                className="min-h-[150px] bg-white/50 dark:bg-black/20 border-black/10 dark:border-white/10 font-serif text-lg focus-visible:ring-blue-500/50 resize-y p-4"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !syllabus || !examName}
                        className="w-full h-16 text-lg font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-[1.01] shadow-xl font-sans"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing ROI...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Generate Strategy <Sparkles className="w-5 h-5" />
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

function ResultsView({ results, onReset }: { results: AnalysisResult, onReset: () => void }) {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif pb-24">

            {/* Header */}
            <header className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onReset} className="text-sm font-bold font-sans opacity-60 hover:opacity-100 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back to Inputs
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80 font-sans">Strategic Blueprint</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">

                {/* Overview */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">Your Attack Plan</h1>
                    <p className="text-xl opacity-60 font-light leading-relaxed">
                        Based on your inputs, the predicted difficulty is <span className="font-medium text-black dark:text-white">{results.summary.predicted_difficulty}</span>.
                        Focusing on just <span className="text-blue-500 font-bold">{results.summary.high_yield_count} key topics</span> can secure ~80% of the value.
                    </p>
                </div>

                {/* Priority Queue Document Flow */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                        <h2 className="text-2xl font-bold">I. Execution Order</h2>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans">Highest ROI First</span>
                    </div>

                    <div className="space-y-2">
                        {results.topics.map((topic, i) => (
                            <div key={i} className="group py-4 flex gap-6 items-start border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 px-4 rounded-xl transition-colors">
                                <span className="text-4xl font-bold opacity-10 font-sans w-12 text-right shrink-0">{String(i + 1).padStart(2, '0')}</span>

                                <div className="space-y-2 grow">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-xl font-bold">{topic.topic}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-sans border ${topic.category === 'High Return' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 border-purple-200' :
                                            topic.category === 'Quick Win' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 border-green-200' :
                                                'bg-gray-100 dark:bg-white/10 text-gray-500 border-gray-200'
                                            }`}>
                                            {topic.category}
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-60 leading-relaxed font-sans max-w-2xl">{topic.reasoning}</p>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans mb-1">Score</div>
                                    <div className="text-xl font-bold font-sans">{topic.priority_score}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Strategy breakdown */}
                <section className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
                            <Target className="w-5 h-5 opacity-40" />
                            <h2 className="text-xl font-bold">Quick Wins</h2>
                        </div>
                        <ul className="space-y-4">
                            {results.strategy.quick_wins.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm opacity-80 font-sans leading-relaxed">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
                            <Layers className="w-5 h-5 opacity-40" />
                            <h2 className="text-xl font-bold">Core Focus</h2>
                        </div>
                        <ul className="space-y-4">
                            {results.strategy.focus_areas.map((item, i) => (
                                <li key={i} className="flex gap-3 text-sm opacity-80 font-sans leading-relaxed">
                                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

            </main>
        </div>
    )
}
