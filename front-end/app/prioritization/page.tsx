'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    Sparkles,
    Target,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    Minus,
    UploadCloud,
    CheckCircle,
    BarChart3,
    FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── Types matching the engine's PriorityReport.to_dict() ───────────────
interface TopicScores {
    frequency: number;
    marks: number;
    recency: number;
    trend: number;
}

interface TopicPriority {
    rank: number;
    topic: string;
    chapter: string;
    unit: string;
    priority_score: number;
    frequency: string;
    avg_marks: number;
    trend: string;
    year_wise: Record<string, number>;
    scores: TopicScores;
    subtopic_count?: number;
    class_level?: string;
    difficulty?: string;
}

interface PriorityReport {
    exam: string;
    subject: string;
    analysis_period: string;
    papers_analysed: number;
    questions_analysed: number;
    topic_priorities: TopicPriority[];
    source?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────
const EXAM_OPTIONS = [
    { value: 'jee_main', label: 'JEE Main', subjects: ['physics', 'chemistry', 'maths'] },
    { value: 'neet', label: 'NEET', subjects: ['physics', 'chemistry', 'biology'] },
    { value: 'cbse', label: 'CBSE 12th', subjects: ['physics', 'chemistry', 'maths', 'biology'] },
];

export default function PrioritizationPage() {
    const [exam, setExam] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PriorityReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedExam = EXAM_OPTIONS.find(e => e.value === exam);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!exam || !subject) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('exam', exam);
            formData.append('subject', subject);
            if (file) {
                formData.append('file', file);
            }

            const response = await fetch('http://localhost:8000/prioritize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Analysis failed: ${errorText}`);
            }

            const data: PriorityReport = await response.json();
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Failed to connect to the engine. Is the API server running?');
        } finally {
            setLoading(false);
        }
    };

    if (results) {
        return <ResultsView results={results} onReset={() => setResults(null)} />;
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
                        <BarChart3 className="w-4 h-4" />
                        Exam Paper Analysis
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
                    >
                        Topic <br className="md:hidden" /> Prioritisation
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        Upload past exam papers. Our engine extracts questions, classifies topics,
                        and tells you <span className="text-black dark:text-white font-medium">exactly what to study first</span>.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl space-y-8"
                >
                    {/* Step 1: Exam & Subject Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center text-sm font-bold font-sans">1</span>
                            <h3 className="text-lg font-bold font-sans">Select Exam & Subject</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Exam Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Exam</label>
                                <select
                                    value={exam}
                                    onChange={(e) => {
                                        setExam(e.target.value);
                                        setSubject('');
                                    }}
                                    className="w-full h-14 px-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 font-serif text-lg focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">Choose exam...</option>
                                    {EXAM_OPTIONS.map(e => (
                                        <option key={e.value} value={e.value}>{e.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60 pl-1 font-sans">Subject</label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={!exam}
                                    className="w-full h-14 px-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 font-serif text-lg focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-40 appearance-none cursor-pointer"
                                >
                                    <option value="">Choose subject...</option>
                                    {selectedExam?.subjects.map(s => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: PDF Upload */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center text-sm font-bold font-sans">2</span>
                            <h3 className="text-lg font-bold font-sans">Upload Exam Paper <span className="text-sm font-normal opacity-50">(optional)</span></h3>
                        </div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file
                                    ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10'
                                    : 'border-black/10 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                                }`}
                        >
                            {file ? (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{file.name}</p>
                                        <p className="text-sm opacity-60 font-sans">{(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto text-gray-400 group-hover:text-blue-500 transition-colors">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Upload a past exam paper</p>
                                        <p className="text-sm opacity-50 font-sans">PDF or text file — the engine will extract & analyze questions</p>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <p className="text-xs text-center opacity-40 font-sans">
                            No paper? No problem — we'll show topic priorities from our syllabus knowledge base.
                        </p>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !exam || !subject}
                        className="w-full h-16 text-lg font-bold rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all hover:scale-[1.01] shadow-xl font-sans"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {file ? 'Extracting & Classifying...' : 'Analyzing Syllabus...'}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                {file ? 'Analyze Exam Paper' : 'Analyze Syllabus Topics'} <Sparkles className="w-5 h-5" />
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

// ─── Results View ───────────────────────────────────────────────────────
function ResultsView({ results, onReset }: { results: PriorityReport; onReset: () => void }) {
    const topics = results.topic_priorities || [];
    const topN = topics.slice(0, 15);
    const fromPaper = results.papers_analysed > 0;

    const TrendIcon = ({ trend }: { trend: string }) => {
        if (trend.includes('rising') || trend.includes('↑')) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (trend.includes('declining') || trend.includes('↓')) return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const scoreBar = (score: number) => {
        const pct = Math.min(score * 100, 100);
        return (
            <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif pb-24">

            {/* Header */}
            <header className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onReset} className="text-sm font-bold font-sans opacity-60 hover:opacity-100 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" /> New Analysis
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80 font-sans">
                            {results.exam.replace('_', ' ').toUpperCase()} — {results.subject.toUpperCase()}
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">

                {/* Overview Cards */}
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold">Priority Report</h1>
                    <p className="text-xl opacity-60 font-light leading-relaxed">
                        {fromPaper ? (
                            <>
                                Analyzed <span className="font-medium text-black dark:text-white">{results.questions_analysed} questions</span> from{' '}
                                <span className="font-medium text-black dark:text-white">{results.papers_analysed} paper(s)</span>.{' '}
                                Period: {results.analysis_period}.
                            </>
                        ) : (
                            <>
                                Showing <span className="font-medium text-black dark:text-white">{topics.length} topics</span> from the{' '}
                                <span className="text-blue-500 font-medium">{results.exam.replace('_', ' ')}</span> syllabus knowledge base for{' '}
                                <span className="text-purple-500 font-medium">{results.subject}</span>.
                                Upload an exam paper for frequency & trend analysis.
                            </>
                        )}
                    </p>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans mb-1">Topics</p>
                            <p className="text-3xl font-bold font-sans">{topics.length}</p>
                        </div>
                        {fromPaper && (
                            <>
                                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans mb-1">Questions</p>
                                    <p className="text-3xl font-bold font-sans">{results.questions_analysed}</p>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans mb-1">Papers</p>
                                    <p className="text-3xl font-bold font-sans">{results.papers_analysed}</p>
                                </div>
                                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans mb-1">Period</p>
                                    <p className="text-lg font-bold font-sans">{results.analysis_period}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Topic Rankings */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                        <h2 className="text-2xl font-bold">Topic Rankings</h2>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans">
                            Sorted by Priority Score
                        </span>
                    </div>

                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-bold uppercase tracking-widest opacity-40 font-sans">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Topic</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-2">Frequency</div>
                        <div className="col-span-1">Marks</div>
                        <div className="col-span-2">Trend</div>
                    </div>

                    {/* Topic Rows */}
                    <div className="space-y-2">
                        {topN.map((topic, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="group md:grid md:grid-cols-12 gap-4 items-center py-4 px-4 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                            >
                                {/* Rank */}
                                <div className="col-span-1">
                                    <span className={`text-2xl font-bold font-sans ${topic.rank <= 3 ? 'text-blue-500' : 'opacity-20'
                                        }`}>
                                        {String(topic.rank).padStart(2, '0')}
                                    </span>
                                </div>

                                {/* Topic Name + Unit */}
                                <div className="col-span-4 space-y-1">
                                    <h3 className="font-bold text-lg leading-tight">{topic.topic}</h3>
                                    {topic.unit && (
                                        <p className="text-xs opacity-40 font-sans">{topic.unit}</p>
                                    )}
                                </div>

                                {/* Priority Score Bar */}
                                <div className="col-span-2 space-y-1">
                                    <div className="text-sm font-bold font-sans">
                                        {typeof topic.priority_score === 'number'
                                            ? topic.priority_score <= 1
                                                ? `${(topic.priority_score * 100).toFixed(0)}%`
                                                : topic.priority_score.toFixed(1)
                                            : topic.priority_score}
                                    </div>
                                    {scoreBar(typeof topic.priority_score === 'number' && topic.priority_score <= 1
                                        ? topic.priority_score
                                        : (topic.priority_score as number) / 100)}
                                </div>

                                {/* Frequency */}
                                <div className="col-span-2">
                                    <span className="text-sm font-sans opacity-70">{topic.frequency}</span>
                                </div>

                                {/* Avg Marks */}
                                <div className="col-span-1">
                                    <span className="text-sm font-bold font-sans">
                                        {topic.avg_marks > 0 ? topic.avg_marks.toFixed(1) : '—'}
                                    </span>
                                </div>

                                {/* Trend */}
                                <div className="col-span-2 flex items-center gap-2">
                                    <TrendIcon trend={topic.trend} />
                                    <span className="text-xs font-sans opacity-60">
                                        {topic.trend.replace('↑', '').replace('↓', '').replace('→', '').trim()}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Score Breakdown for Top 5 */}
                {topN.length > 0 && topN[0].scores && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                            <h2 className="text-2xl font-bold">Score Breakdown</h2>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-40 font-sans">
                                Top 5 Topics
                            </span>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topN.slice(0, 6).map((topic, i) => (
                                <div key={i} className="p-6 bg-white/50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-xs font-bold font-sans text-blue-500">#{topic.rank}</span>
                                            <h4 className="font-bold text-lg leading-tight mt-1">{topic.topic}</h4>
                                        </div>
                                        <TrendIcon trend={topic.trend} />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="opacity-50">Frequency</span>
                                                <span className="font-bold">{(topic.scores.frequency * 100).toFixed(0)}%</span>
                                            </div>
                                            {scoreBar(topic.scores.frequency)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="opacity-50">Marks Weight</span>
                                                <span className="font-bold">{(topic.scores.marks * 100).toFixed(0)}%</span>
                                            </div>
                                            {scoreBar(topic.scores.marks)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="opacity-50">Recency</span>
                                                <span className="font-bold">{(topic.scores.recency * 100).toFixed(0)}%</span>
                                            </div>
                                            {scoreBar(topic.scores.recency)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="opacity-50">Trend</span>
                                                <span className="font-bold">{(topic.scores.trend * 100).toFixed(0)}%</span>
                                            </div>
                                            {scoreBar(topic.scores.trend)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                {!fromPaper && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-8 text-center space-y-4">
                        <FileText className="w-10 h-10 mx-auto opacity-40" />
                        <h3 className="text-xl font-bold">Want frequency & trend data?</h3>
                        <p className="opacity-60 font-sans max-w-lg mx-auto">
                            Upload a past exam paper PDF to see how often each topic appears, marks distribution, and whether topics are trending up or down.
                        </p>
                        <Button onClick={onReset} variant="outline" className="rounded-full font-sans font-bold">
                            Upload an Exam Paper <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

            </main>
        </div>
    );
}
