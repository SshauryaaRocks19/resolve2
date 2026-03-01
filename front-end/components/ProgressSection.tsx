'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
import { useUser } from '@clerk/nextjs';

type TestRecord = {
    id: string;
    user_id: string;
    topic: string;
    score: number;
    total: number;
    weaknesses: string[];
    created_at: string;
};

type MasteryRecord = {
    id: string;
    user_id: string;
    topic: string;
    micro_concept: string;
    error_weight: number;
};

export default function ProgressSection() {
    const { user } = useUser();
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [mastery, setMastery] = useState<MasteryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [topics, setTopics] = useState<string[]>(['Overall']);
    const [testTopic, setTestTopic] = useState('Overall');
    const [conceptTopic, setConceptTopic] = useState('Overall');

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/progress?userId=${encodeURIComponent(user.id)}`);
                if (!res.ok) throw new Error('Failed to fetch progress');
                const data = await res.json();
                setTests(data.tests || []);
                setMastery(data.mastery || []);

                // Build unique topics
                const uniqueTopics = new Set<string>();
                (data.tests || []).forEach((t: TestRecord) => uniqueTopics.add(t.topic));
                (data.mastery || []).forEach((m: MasteryRecord) => uniqueTopics.add(m.topic));
                const topicList = ['Overall', ...Array.from(uniqueTopics)];
                setTopics(topicList);
            } catch (err) {
                console.error('Progress fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    // Build test scores data for line chart
    const getTestData = (topic: string) => {
        const filtered = topic === 'Overall' ? tests : tests.filter(t => t.topic === topic);
        if (filtered.length === 0) return [];
        return filtered.map((t, i) => ({
            name: `Test ${i + 1}`,
            score: Math.round((t.score / t.total) * 100),
        }));
    };

    // Build concept strength data for radar chart (from mastery table)
    const getConceptData = (topic: string) => {
        const filtered = topic === 'Overall' ? mastery : mastery.filter(m => m.topic === topic);
        if (filtered.length === 0) return [];

        // Group by micro_concept, compute strength as inverse of error_weight
        // Higher error_weight = weaker → lower strength score
        const maxWeight = Math.max(...filtered.map(m => m.error_weight), 1);
        return filtered.slice(0, 6).map(m => ({
            subject: m.micro_concept.length > 20 ? m.micro_concept.slice(0, 18) + '…' : m.micro_concept,
            A: Math.max(0, Math.round(100 - (m.error_weight / maxWeight) * 80)),
            fullMark: 100,
        }));
    };

    // Build weaknesses from mastery (sorted by error_weight desc)
    const getConceptualWeaknesses = (topic: string) => {
        const filtered = topic === 'Overall' ? mastery : mastery.filter(m => m.topic === topic);
        return filtered.slice(0, 5).map(m => `${m.topic}: ${m.micro_concept}`);
    };

    // Build test insights from recent tests
    const getTestInsights = (topic: string) => {
        const filtered = topic === 'Overall' ? tests : tests.filter(t => t.topic === topic);
        if (filtered.length === 0) return ['Complete a test to see performance insights.'];

        const insights: string[] = [];
        const scores = filtered.map(t => Math.round((t.score / t.total) * 100));

        if (scores.length >= 2) {
            const latest = scores[scores.length - 1];
            const prev = scores[scores.length - 2];
            if (latest > prev) {
                insights.push(`Improved by ${latest - prev}% since your previous test.`);
            } else if (latest < prev) {
                insights.push(`Score dropped by ${prev - latest}% — review recent weaknesses.`);
            } else {
                insights.push('Score unchanged from last test — try targeting specific gaps.');
            }
        }

        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        insights.push(`Average score across ${scores.length} test(s): ${avg}%.`);

        // Collect all weaknesses from recent tests
        const recentWeaknesses = filtered.slice(-3).flatMap(t => t.weaknesses || []);
        if (recentWeaknesses.length > 0) {
            const unique = [...new Set(recentWeaknesses)];
            insights.push(`Top recurring gaps: ${unique.slice(0, 2).join(', ')}.`);
        }

        return insights;
    };

    // Empty state
    const hasData = tests.length > 0 || mastery.length > 0;

    return (
        <section className="relative w-full bg-white dark:bg-[#020617] px-4 py-16 transition-colors duration-500">
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

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-3 text-lg text-gray-500">Loading your progress...</span>
                    </div>
                ) : !hasData ? (
                    <div className="text-center py-20 space-y-4">
                        <p className="text-2xl font-serif text-gray-400 dark:text-white/40">
                            No test data yet
                        </p>
                        <p className="text-gray-500 dark:text-white/50 max-w-md mx-auto">
                            Take your first test to start tracking your progress. Your scores, weaknesses, and conceptual gaps will appear here.
                        </p>
                    </div>
                ) : (
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
                                        {topics.map(topic => (
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
                                {getTestData(testTopic).length > 0 ? (
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
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No tests for this topic yet.
                                    </div>
                                )}
                            </div>

                            {/* Test Insights */}
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
                                        {topics.map(topic => (
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

                            {/* Radar Chart */}
                            <div className="h-[250px] w-full mb-6 relative">
                                {getConceptData(conceptTopic).length > 0 ? (
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
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        No concept data for this topic yet.
                                    </div>
                                )}
                            </div>

                            {/* Conceptual Gaps */}
                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-500/10">
                                <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3">
                                    Detailed Conceptual Gaps
                                </h4>
                                <ul className="space-y-2">
                                    {getConceptualWeaknesses(conceptTopic).length > 0 ? (
                                        getConceptualWeaknesses(conceptTopic).map((weakness, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                                                <span>{weakness}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-sm text-gray-400">No weaknesses recorded yet. Take a test to identify gaps.</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </section>
    );
}
