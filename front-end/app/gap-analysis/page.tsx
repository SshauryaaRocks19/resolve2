'use client';

import { useState } from 'react';
import { analyzeGap } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Gap {
    concept: string;
    performance_score: number;
    category: string;
    missing_prerequisites: {
        prerequisite: string;
        score: number;
        category: string;
    }[];
    all_prerequisites: string[];
    priority: number;
}

interface AnalysisResult {
    gaps: Gap[];
    summary: {
        total_gaps: number;
        high_priority_gaps: number;
        categories: Record<string, number>;
        overall_performance: number;
    };
    recommendations: string[];
}

interface WrongQuestion {
    id: number;
    question: string;
    marks: number;
}

export default function GapAnalysisPage() {
    const [syllabus, setSyllabus] = useState(`Course: Introduction to Machine Learning
  
Week 1: Linear Regression - requires knowledge of calculus and linear algebra
Week 2: Logistic Regression - builds on linear regression
Week 3: Neural Networks - requires understanding of gradient descent and backpropagation
Week 4: Deep Learning - extends neural networks`);

    const [lectureNotes, setLectureNotes] = useState(`Neural Networks build on linear regression concepts.
Backpropagation depends on understanding of chain rule from calculus.
Gradient Descent is an optimization algorithm used in machine learning.
Convolutional Neural Networks extend basic neural networks for image processing.`);

    const [totalMarks, setTotalMarks] = useState(100);
    const [obtainedMarks, setObtainedMarks] = useState(65);
    const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([
        { id: 1, question: "Explain backpropagation algorithm in neural networks", marks: 10 },
        { id: 2, question: "Derive gradient descent update rule using calculus", marks: 15 }
    ]);

    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addQuestion = () => {
        setWrongQuestions([...wrongQuestions, { id: Date.now(), question: '', marks: 0 }]);
    };

    const removeQuestion = (id: number) => {
        setWrongQuestions(wrongQuestions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: number, field: 'question' | 'marks', value: string | number) => {
        setWrongQuestions(wrongQuestions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const payload = {
                syllabus,
                lecture_notes: lectureNotes,
                test_performance: {
                    total_marks: Number(totalMarks),
                    obtained_marks: Number(obtainedMarks),
                    wrong_questions: wrongQuestions.map(({ question, marks }) => ({ question, marks: Number(marks) })),
                    correct_questions: [] // Optional
                }
            };

            const data = await analyzeGap(payload);
            if (data.error) {
                throw new Error(data.error);
            }
            setResults(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
                        GAP <span className="text-primary">ANALYSIS</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                        Identify conceptual gaps in your understanding by analyzing syllabus, notes, and test performance.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <div className="space-y-8 bg-card p-6 rounded-2xl border border-border shadow-sm">
                        <h2 className="text-2xl font-bold tracking-tight">Input Data</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Syllabus</label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-md border bg-background resize-none focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={syllabus}
                                    onChange={(e) => setSyllabus(e.target.value)}
                                    placeholder="Paste your course syllabus here..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Lecture Notes</label>
                                <textarea
                                    className="w-full h-32 p-3 rounded-md border bg-background resize-none focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={lectureNotes}
                                    onChange={(e) => setLectureNotes(e.target.value)}
                                    placeholder="Paste your lecture notes here..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Obtained Marks</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-md border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={obtainedMarks}
                                        onChange={(e) => setObtainedMarks(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">Wrong Questions</label>
                                    <Button variant="outline" size="sm" onClick={addQuestion} className="gap-2">
                                        <Plus className="w-4 h-4" /> Add Question
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {wrongQuestions.map((q) => (
                                        <div key={q.id} className="flex gap-2 items-start">
                                            <input
                                                type="text"
                                                className="flex-1 p-2 text-sm rounded-md border bg-background focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="Question text..."
                                                value={q.question}
                                                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                className="w-20 p-2 text-sm rounded-md border bg-background focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="Marks"
                                                value={q.marks}
                                                onChange={(e) => updateQuestion(q.id, 'marks', e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeQuestion(q.id)}
                                                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze Gaps <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>

                        {results ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-card rounded-xl border border-border">
                                        <p className="text-sm text-muted-foreground">Total Gaps Found</p>
                                        <p className="text-3xl font-black text-primary">{results.summary.total_gaps}</p>
                                    </div>
                                    <div className="p-4 bg-card rounded-xl border border-border">
                                        <p className="text-sm text-muted-foreground">High Priority</p>
                                        <p className="text-3xl font-black text-destructive">{results.summary.high_priority_gaps}</p>
                                    </div>
                                </div>

                                {/* Recommendations */}
                                <div className="bg-card p-6 rounded-xl border border-border">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        Corrective Actions
                                    </h3>
                                    <ul className="space-y-3">
                                        {results.recommendations.map((rec, i) => (
                                            <li key={i} className="flex gap-3 text-sm">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {i + 1}
                                                </span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Detailed Gaps */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold">Identified Gaps</h3>
                                    {results.gaps.map((gap, i) => (
                                        <div key={i} className="p-5 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{gap.concept}</h4>
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${gap.priority > 1 ? 'bg-destructive/10 text-destructive' : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    Priority: {gap.priority.toFixed(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Category: <span className="uppercase tracking-wider text-xs font-medium">{gap.category}</span>
                                            </p>

                                            {gap.missing_prerequisites.length > 0 && (
                                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                    <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Missing Prerequisites</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {gap.missing_prerequisites.map((p, j) => (
                                                            <span key={j} className="text-xs bg-background border px-2 py-1 rounded-md">
                                                                {p.prerequisite}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 p-8 border-2 border-dashed rounded-xl">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                    <ArrowRight className="w-8 h-8 opacity-50" />
                                </div>
                                <p>Run an analysis to see detailed gaps and recommendations here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
