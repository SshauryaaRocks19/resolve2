'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Clock, BarChart3, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

// Data strictly matching ProgressSection & QuizzesPage
const PREVIOUS_TESTS = [
    {
        id: 5,
        title: "Start of term Mock Test 5",
        date: "2 days ago",
        score: 85,
        topics: ["Calculus", "Statistics"],
        status: "Excellent",
        weaknesses: [
            { topic: "Statistics", error: "Confidence Intervals: Believing a 95% CI means there is a 95% chance the parameter is in the interval." }
        ]
    },
    {
        id: 4,
        title: "Mid-Term Review Test 4",
        date: "1 week ago",
        score: 78,
        topics: ["Probability", "Linear Algebra"],
        status: "Good",
        weaknesses: [
            { topic: "Probability", error: "Conditionals: Fundamental misunderstanding that P(A|B) is about shrinking the sample space to B." }
        ]
    },
    {
        id: 3,
        title: "Comprehensive Assessment Test 3",
        date: "2 weeks ago",
        score: 68,
        topics: ["Calculus", "Linear Algebra"],
        status: "Needs Improvement",
        weaknesses: [
            { topic: "Calculus", error: "Integrals: Failing to conceptualize the Definite Integral as an accumulation of change over an interval." },
            { topic: "Linear Algebra", error: "Determinants: Viewing the determinant merely as a calculation rather than the volume scaling factor." },
            { topic: "Calculus", error: "Series: Misunderstanding that convergence of terms to 0 does not imply convergence of the series." }
        ]
    },
    {
        id: 2,
        title: "Unit Test 2",
        date: "3 weeks ago",
        score: 72,
        topics: ["Statistics", "Probability"],
        status: "Average",
        weaknesses: [
            { topic: "Statistics", error: "P-Values: Persistently misinterpreting P-value as the 'Probability that the Hypothesis is Wrong'." },
            { topic: "Probability", error: "Expectation: Misinterpreting 'Expected Value' as the 'Most Likely Outcome' (Mode) rather than weighted average." }
        ]
    },
    {
        id: 1,
        title: "Diagnostic Test 1",
        date: "1 month ago",
        score: 65,
        topics: ["Calculus", "Linear Algebra"],
        status: "Baseline",
        weaknesses: [
            { topic: "Calculus", error: "Limits: Believing that f(a) existing implies the limit at x->a must be f(a) (Continuity misconception)." },
            { topic: "Linear Algebra", error: "Vector Spaces: Confusing a 'Basis' with a 'Spanning Set' (Basis must be linearly independent)." },
            { topic: "Linear Algebra", error: "Linear Maps: Misunderstanding the Kernel as the set of vectors mapping to zero vs mapping to themselves." }
        ]
    }
];

export default function TestsPage() {
    const router = useRouter();
    const [topic, setTopic] = useState("Calculus");
    const [questionCount, setQuestionCount] = useState(10);

    const handleStartTest = () => {
        // In a real app, we'd pass these params. For now, we go to the static active quiz.
        router.push(`/tests/take?topic=${encodeURIComponent(topic)}&count=${questionCount}`);
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

                {/* 1. New Test Configuration */}
                <section className="relative overflow-hidden rounded-3xl bg-black dark:bg-white text-white dark:text-black p-8 md:p-12 shadow-2xl">
                    {/* Background Effects */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[300px] w-[300px] rounded-full bg-blue-500/30 blur-[60px]" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[200px] w-[200px] rounded-full bg-purple-500/30 blur-[60px]" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                                Ready to challenge yourself, Sshauryaa?
                            </h2>
                            <p className="text-white/70 dark:text-black/70 text-lg max-w-md">
                                Generate a custom test to target your weak concepts. We'll track your time and precision.
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

                        <div className="bg-white/10 dark:bg-black/5 backdrop-blur-xl border border-white/20 dark:border-black/10 rounded-2xl p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium uppercase tracking-wider opacity-80">Topic</label>
                                <Input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="bg-white/20 dark:bg-black/10 border-white/20 dark:border-black/10 text-white dark:text-black placeholder:text-white/50 focus-visible:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium uppercase tracking-wider opacity-80">Number of Questions</label>
                                    <span className="text-xl font-bold">{questionCount}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    step="5"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full h-2 bg-white/20 dark:bg-black/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>

                            <Button
                                onClick={handleStartTest}
                                className="w-full h-12 text-lg font-bold bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900 shadow-lg transition-transform active:scale-95"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Start Test
                            </Button>
                        </div>
                    </div>
                </section>


                {/* 2. Previous Tests Carousel */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-serif font-bold">Previous Tests</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-black/10 dark:border-white/10">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-black/10 dark:border-white/10">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Carousel Container (Horizontal Scroll) */}
                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x p-1 -mx-4 px-4 scrollbar-hide">
                        {PREVIOUS_TESTS.map((test) => (
                            <motion.div
                                key={test.id}
                                whileHover={{ y: -5 }}
                                className="min-w-[300px] md:min-w-[350px] snap-center rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{test.date}</span>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${test.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                test.score >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {test.score}%
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-lg mb-2 line-clamp-2">{test.title}</h4>

                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {test.topics.map(t => (
                                            <span key={t} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Mini Weakness Preview */}
                                {test.weaknesses.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">Primary Weakness:</p>
                                        <p className="text-xs text-red-500 dark:text-red-400 line-clamp-2">
                                            {test.weaknesses[0].error}
                                        </p>
                                    </div>
                                )}

                                <Button variant="ghost" className="w-full mt-4 text-xs hover:bg-black/5 dark:hover:bg-white/10">
                                    View Analysis <BarChart3 className="w-3 h-3 ml-2" />
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
}
