'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Sparkles, TrendingUp, AlertTriangle, BookOpen, Target, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Interfaces
interface PrioritizedTopic {
    topic: string;
    priority_score: number; // 0-100
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
    // Input States
    const [syllabus, setSyllabus] = useState('');
    const [examName, setExamName] = useState('');
    const [pastPapers, setPastPapers] = useState('');

    // Analysis States
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);

    // Mock Analysis Function
    const handleAnalyze = () => {
        if (!syllabus || !examName) return;

        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            const mockResults: AnalysisResult = {
                topics: [
                    {
                        topic: "Neural Networks & Backpropagation",
                        priority_score: 95,
                        category: "Core Concept",
                        difficulty: "Hard",
                        avg_marks: 15,
                        reasoning: "Consistently appears in Section C (Long Answer). Foundation for 40% of the paper."
                    },
                    {
                        topic: "Linear Regression Basics",
                        priority_score: 88,
                        category: "Quick Win",
                        difficulty: "Easy",
                        avg_marks: 8,
                        reasoning: "Easiest topic with guaranteed 5-8 marks. High ROI."
                    },
                    {
                        topic: "Gradient Descent Variants",
                        priority_score: 75,
                        category: "High Return",
                        difficulty: "Medium",
                        avg_marks: 10,
                        reasoning: "Trending upward in last 3 years papers."
                    },
                    {
                        topic: "History of AI",
                        priority_score: 20,
                        category: "Deprioritize",
                        difficulty: "Easy",
                        avg_marks: 2,
                        reasoning: "Rarely asked. Low mark density."
                    },
                    {
                        topic: "SVM Kernels",
                        priority_score: 60,
                        category: "Bonus",
                        difficulty: "Hard",
                        avg_marks: 5,
                        reasoning: "Good for differentiation but time-consuming."
                    }
                ],
                summary: {
                    total_topics: 12,
                    high_yield_count: 3,
                    predicted_difficulty: "Moderate"
                },
                strategy: {
                    focus_areas: ["Neural Networks", "Optimization Algorithms"],
                    quick_wins: ["Linear Regression", "Basic Definitions"]
                }
            };
            setResults(mockResults);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase">
                        <Sparkles className="w-4 h-4" />
                        AI Power-Up
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                        PRIORITIZATION <span className="text-primary">ENGINE</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl">
                        Stop studying blindly. Let AI analyze trends and difficulty to tell you exactly what to study for maximum marks in minimum time.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Inputs */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary" />
                                Exam Details
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Exam Name / Format</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CS229 Final, JEE Advanced, USMLE Step 1"
                                        className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={examName}
                                        onChange={(e) => setExamName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Syllabus</label>
                                    <textarea
                                        placeholder="Paste your full syllabus here..."
                                        className="w-full h-40 p-3 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={syllabus}
                                        onChange={(e) => setSyllabus(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Past Papers / Trends (Optional)
                                    </label>
                                    <textarea
                                        placeholder="Paste text from past papers or specific trends you want to include..."
                                        className="w-full h-24 p-3 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={pastPapers}
                                        onChange={(e) => setPastPapers(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !syllabus || !examName}
                                className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Crunching Numbers...
                                    </>
                                ) : (
                                    <>
                                        Generatie Strategy <BrainCircuit className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="lg:col-span-7 space-y-8">
                        {results ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                {/* Strategy Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 bg-card border border-border rounded-xl">
                                        <div className="text-sm text-muted-foreground mb-1">Predicted Difficulty</div>
                                        <div className="text-2xl font-black text-foreground">{results.summary.predicted_difficulty}</div>
                                    </div>
                                    <div className="p-5 bg-card border border-border rounded-xl">
                                        <div className="text-sm text-muted-foreground mb-1">High Yield Topics</div>
                                        <div className="text-2xl font-black text-primary">{results.summary.high_yield_count}</div>
                                    </div>
                                    <div className="p-5 bg-card border border-border rounded-xl">
                                        <div className="text-sm text-muted-foreground mb-1">Est. Mark Coverage</div>
                                        <div className="text-2xl font-black text-green-500">~85%</div>
                                    </div>
                                </div>

                                {/* Matrix / Categories */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Quick Wins */}
                                    <div className="bg-green-500/5 border border-green-500/20 p-5 rounded-xl">
                                        <h3 className="text-green-600 font-bold flex items-center gap-2 mb-3">
                                            <Target className="w-5 h-5" /> Quick Wins (Study First)
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                                            {results.topics
                                                .filter(t => t.category === 'Quick Win')
                                                .map(t => <li key={t.topic}>{t.topic}</li>)
                                            }
                                        </ul>
                                    </div>

                                    {/* Core Concepts */}
                                    <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl">
                                        <h3 className="text-blue-600 font-bold flex items-center gap-2 mb-3">
                                            <TrendingUp className="w-5 h-5" /> Core Concepts (High Value)
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm opacity-80">
                                            {results.topics
                                                .filter(t => t.category === 'Core Concept')
                                                .map(t => <li key={t.topic}>{t.topic}</li>)
                                            }
                                        </ul>
                                    </div>
                                </div>

                                {/* Detailed Priority List */}
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold">Priority Queue</h3>
                                    {results.topics.map((topic, index) => (
                                        <div
                                            key={index}
                                            className="group bg-card hover:bg-muted/50 border border-border p-5 rounded-xl transition-all hover:shadow-md flex flex-col md:flex-row gap-4 md:items-center justify-between"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                    <h4 className="font-bold text-lg">{topic.topic}</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground pl-11">
                                                    {topic.reasoning}
                                                </p>
                                            </div>

                                            <div className="flex flex-row md:flex-col gap-2 md:gap-1 pl-11 md:pl-0 md:items-end flex-shrink-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${topic.category === 'Quick Win' ? 'bg-green-500/10 text-green-600' :
                                                        topic.category === 'Core Concept' ? 'bg-blue-500/10 text-blue-600' :
                                                            topic.category === 'Deprioritize' ? 'bg-destructive/10 text-destructive' :
                                                                'bg-secondary text-secondary-foreground'
                                                    }`}>
                                                    {topic.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    Results Impact: {topic.priority_score}/100
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground space-y-6 p-8 border-2 border-dashed border-border rounded-3xl bg-card/30">
                                <div className="p-4 bg-muted rounded-full">
                                    <BrainCircuit className="w-12 h-12 opacity-50" />
                                </div>
                                <div className="text-center space-y-2 max-w-md">
                                    <h3 className="text-xl font-bold text-foreground">Ready to Strategize</h3>
                                    <p>
                                        Enter your exam details and syllabus on the left. The AI will cross-reference trends to build your optimal study path.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
