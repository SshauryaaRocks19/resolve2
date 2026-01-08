'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Data strictly matching ProgressSection
const QUIZZES = [
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

export default function QuizzesPage() {
    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500">

            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-serif font-bold tracking-wide">Previous Quizzes</h1>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        5 Attempts
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">

                {QUIZZES.map((quiz, index) => (
                    <motion.div
                        key={quiz.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm hover:shadow-md transition-all ${quiz.score < 70 ? 'dark:bg-red-900/5 bg-red-50/50' : ''
                            }`}
                    >
                        {/* Score Badge */}
                        <div className="absolute right-6 top-6 flex flex-col items-end">
                            <div className={`text-4xl font-black ${quiz.score >= 80 ? 'text-green-600 dark:text-green-400' :
                                    quiz.score >= 70 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-red-600 dark:text-red-400'
                                }`}>
                                {quiz.score}%
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                                {quiz.status}
                            </span>
                        </div>

                        <div className="pr-24">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-bold font-serif">{quiz.title}</h2>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{quiz.date}</span>
                            </div>

                            <div className="flex gap-2 mb-6">
                                {quiz.topics.map(t => (
                                    <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-medium text-gray-600 dark:text-gray-300">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Conceptual Gaps Detected */}
                            <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white/90">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Conceptual Gaps Detected:
                                </h3>
                                <ul className="space-y-2 pl-1">
                                    {quiz.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                                            <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-200 dark:bg-white/10 font-bold uppercase tracking-wider min-w-[max-content]">
                                                {w.topic}
                                            </span>
                                            <span>{w.error}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="mt-6 flex gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                            <Button variant="outline" size="sm" className="gap-2 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
                                <FileText className="h-4 w-4" />
                                View Full Analysis
                            </Button>
                            <Button variant="default" size="sm" className="gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                <CheckCircle2 className="h-4 w-4" />
                                Retake Equivalent
                            </Button>
                        </div>

                    </motion.div>
                ))}

            </main>
        </div>
    );
}
