'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// --- Mock Data ---

const TOPICS = ["Overall", "Calculus", "Linear Algebra", "Probability", "Statistics"];

const TEST_SCORES_DATA = {
    "Overall": [
        { name: 'Test 1', score: 65 },
        { name: 'Test 2', score: 72 },
        { name: 'Test 3', score: 68 },
        { name: 'Test 4', score: 78 },
        { name: 'Test 5', score: 85 },
    ],
    "Calculus": [
        { name: 'Test 1', score: 50 },
        { name: 'Test 2', score: 60 },
        { name: 'Test 3', score: 55 },
        { name: 'Test 4', score: 70 },
        { name: 'Test 5', score: 80 },
    ],
    // Fallback for others
    "default": [
        { name: 'Test 1', score: 60 },
        { name: 'Test 2', score: 65 },
        { name: 'Test 3', score: 70 },
        { name: 'Test 4', score: 72 },
        { name: 'Test 5', score: 75 },
    ]
};

const CONCEPT_STRENGTH_DATA = {
    "Overall": [
        { subject: 'Theory', A: 80, fullMark: 100 },
        { subject: 'Application', A: 65, fullMark: 100 },
        { subject: 'Analysis', A: 45, fullMark: 100 },
        { subject: 'Synthesis', A: 70, fullMark: 100 },
        { subject: 'Evaluation', A: 50, fullMark: 100 },
    ],
    "Calculus": [
        { subject: 'Limits', A: 90, fullMark: 100 },
        { subject: 'Derivatives', A: 75, fullMark: 100 },
        { subject: 'Integrals', A: 40, fullMark: 100 },
        { subject: 'Series', A: 50, fullMark: 100 },
        { subject: 'Diff Eq', A: 30, fullMark: 100 },
    ],
    "Linear Algebra": [
        { subject: 'Vectors', A: 85, fullMark: 100 },
        { subject: 'Matrices', A: 80, fullMark: 100 },
        { subject: 'Eigenvalues', A: 50, fullMark: 100 },
        { subject: 'Transforms', A: 65, fullMark: 100 },
        { subject: 'Spaces', A: 60, fullMark: 100 },
    ],
    "Probability": [
        { subject: 'Bayes Theorem', A: 45, fullMark: 100 },
        { subject: 'Distributions', A: 75, fullMark: 100 },
        { subject: 'Random Vars', A: 65, fullMark: 100 },
        { subject: 'Expectation', A: 85, fullMark: 100 },
        { subject: 'Joint Prob', A: 55, fullMark: 100 },
    ],
    "Statistics": [
        { subject: 'Hypothesis', A: 50, fullMark: 100 },
        { subject: 'Regression', A: 70, fullMark: 100 },
        { subject: 'ANOVA', A: 40, fullMark: 100 },
        { subject: 'Estimation', A: 80, fullMark: 100 },
        { subject: 'Sampling', A: 90, fullMark: 100 },
    ],
    "default": [
        { subject: 'Concept A', A: 60, fullMark: 100 },
        { subject: 'Concept B', A: 70, fullMark: 100 },
        { subject: 'Concept C', A: 50, fullMark: 100 },
        { subject: 'Concept D', A: 80, fullMark: 100 },
        { subject: 'Concept E', A: 40, fullMark: 100 },
    ]
};

const TEST_INSIGHTS = {
    "Overall": ["Consistent improvement observed in the last 2 tests.", "Test 3 score dip due to time management issues.", "High accuracy maintained in MCQ sections."],
    "Calculus": ["Struggled with complex integration problems in Test 3.", "Strong performance in limit-based questions.", "Need to improve speed on application-based problems."],
    "Linear Algebra": ["Matrix evaluations were slower than average.", "Excellent grasp of basic vector operations.", "Conceptual errors in eigenvalue word problems."],
    "Probability": ["Bayesian problems consistently result in sign errors.", "Good understanding of probability distributions.", "Review conditional probability formulas."],
    "Statistics": ["Hypothesis testing logic needs clarification.", "Regression analysis graphs were misinterpreted.", "Strong calculation skills in ANOVA tables."],
};

const CONCEPTUAL_WEAKNESSES = {
    "Overall": [
        "Calculus: Fundamental confusion between the limit definition of a derivative and average rate of change.",
        "Linear Algebra: Misunderstanding the geometric interpretation of eigenvectors as scale factors.",
        "Probability: Falsely equating 'Mutually Exclusive' with 'Independent' events."
    ],
    "Calculus": [
        "Limits: Believing that f(a) existing implies the limit at x->a must be f(a) (Continuity misconception).",
        "Integrals: Failing to conceptualize the Definite Integral as an accumulation of change over an interval.",
        "Series: Misunderstanding that convergence of terms to 0 does not imply convergence of the series (Harmonic Series fallacy)."
    ],
    "Linear Algebra": [
        "Vector Spaces: Confusing a 'Basis' with a 'Spanning Set' (Basis must be linearly independent).",
        "Linear Maps: Misunderstanding the Kernel as the set of vectors mapping to zero vs mapping to themselves.",
        "Determinants: Viewing the determinant merely as a calculation rather than the volume scaling factor of the transformation."
    ],
    "Probability": [
        "Conditionals: Fundamental misunderstanding that P(A|B) is about shrinking the sample space to B.",
        "Random Variables: Confusing the Probability Density Function (PDF) height with the actual probability of a point.",
        "Expectation: Misinterpreting 'Expected Value' as the 'Most Likely Outcome' (Mode) rather than the weighted average."
    ],
    "Statistics": [
        "P-Values: Persistently misinterpreting P-value as the 'Probability that the Hypothesis is Wrong'.",
        "Confidence Intervals: Believing a 95% CI means there is a 95% chance the parameter is in the interval (vs. long-run capture rate).",
        "Correlation: Conceptual failure to distinguish between Correlation (linear association) and Causation."
    ],
};

export default function ProgressSection() {
    const [testTopic, setTestTopic] = useState("Overall");
    const [conceptTopic, setConceptTopic] = useState("Overall");

    const getTestData = (topic: string) => {
        return TEST_SCORES_DATA[topic as keyof typeof TEST_SCORES_DATA] || TEST_SCORES_DATA["default"];
    };

    const getConceptData = (topic: string) => {
        return CONCEPT_STRENGTH_DATA[topic as keyof typeof CONCEPT_STRENGTH_DATA] || CONCEPT_STRENGTH_DATA["default"];
    };

    const getTestInsights = (topic: string) => {
        return TEST_INSIGHTS[topic as keyof typeof TEST_INSIGHTS] || ["Review recent test performance for specific details."];
    };

    const getConceptualWeaknesses = (topic: string) => {
        return CONCEPTUAL_WEAKNESSES[topic as keyof typeof CONCEPTUAL_WEAKNESSES] || ["Review core concepts in this topic."];
    };

    return (
        <section className="relative w-full bg-white dark:bg-[#020617] px-4 py-16 transition-colors duration-500">
            {/* Content Container */}
            <div className="mx-auto max-w-6xl space-y-12">

                {/* Section Header */}
                <div className="text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="font-serif text-3xl md:text-5xl text-black dark:text-white"
                    >
                        Your Progress
                    </motion.h2>
                    <p className="text-gray-500 dark:text-white/60 max-w-2xl mx-auto">
                        Track your performance and identify areas for improvement.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT: Test Scores */}
                    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif text-black dark:text-white">Test Scores</h3>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        {testTopic} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-[#0a0a2a] border-black/10 dark:border-white/10">
                                    {TOPICS.map(topic => (
                                        <DropdownMenuItem
                                            key={topic}
                                            onClick={() => setTestTopic(topic)}
                                            className="text-black dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 cursor-pointer"
                                        >
                                            {topic}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Graph */}
                        <div className="h-[250px] w-full mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getTestData(testTopic)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-white/5" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="currentColor"
                                        className="text-gray-400 dark:text-white/40 text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        className="text-gray-400 dark:text-white/40 text-xs"
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#2563eb"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Weaknesses (Test Insights) */}
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-500/10">
                            <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
                                {testTopic === "Overall" ? "Performance Insights" : "Test Feedback"}
                            </h4>
                            <ul className="space-y-2">
                                {getTestInsights(testTopic).map((insight, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        <span>{insight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>


                    {/* RIGHT: Conceptual Strength */}
                    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-xl backdrop-blur-md transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif text-black dark:text-white">Conceptual Strength</h3>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 border-black/10 dark:border-white/10 bg-transparent text-black dark:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                        {conceptTopic} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-[#0a0a2a] border-black/10 dark:border-white/10">
                                    {TOPICS.map(topic => (
                                        <DropdownMenuItem
                                            key={topic}
                                            onClick={() => setConceptTopic(topic)}
                                            className="text-black dark:text-white focus:bg-gray-100 dark:focus:bg-white/10 cursor-pointer"
                                        >
                                            {topic}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Graph - Radar Chart for Concepts */}
                        <div className="h-[250px] w-full mb-6 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getConceptData(conceptTopic)}>
                                    <PolarGrid stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-gray-500 dark:text-white/60" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Strength"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Weaknesses (Specific Conceptual Gaps) */}
                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-500/10">
                            <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3">
                                Detailed Conceptual Gaps
                            </h4>
                            <ul className="space-y-2">
                                {getConceptualWeaknesses(conceptTopic).map((weakness, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                        <span>{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
