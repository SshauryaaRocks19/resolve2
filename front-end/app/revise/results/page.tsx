'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Play,
    Pause,
    RotateCcw,
    Zap,
    Target,
    Brain,
    BookOpen,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- MOCK DATA BASED ON SYLLABUS ---
const PRIORITY_TOPICS = [
    {
        unit: "Unit 2: Derivatives",
        topics: [
            { name: "Gradient and Directional Derivatives", gap: "High", reason: "Confusion between vector/scalar outputs." },
            { name: "Jacobian Matrix", gap: "Critical", reason: "Foundational for change of variables." },
            { name: "Multivariable Chain Rule", gap: "Medium", reason: "Tree diagram setup errors." }
        ]
    },
    {
        unit: "Unit 3: Applications",
        topics: [
            { name: "Lagrange Multipliers", gap: "High", reason: "Difficulty setting up constraint equations." },
            { name: "Hessian Matrix & Optimization", gap: "Medium", reason: "Second derivative test misapplication." }
        ]
    }
];

const FLASHCARDS = [
    {
        front: "What is the geometric interpretation of the Gradient Vector ∇f at a point?",
        back: "It points in the direction of steepest ascent. Its magnitude |∇f| is the rate of increase in that direction. It is normal to the level curve/surface."
    },
    {
        front: "Define the Jacobian Matrix for a function f: R^n -> R^m.",
        back: "It is the m x n matrix of all first-order partial derivatives. J_ij = ∂f_i / ∂x_j. It represents the best linear approximation of the function near a point."
    },
    {
        front: "State the formula for the Directional Derivative using the Gradient.",
        back: "D_u f(x) = ∇f(x) • u, where u is a UNIT vector. If u is not a unit vector, you must normalize it first!"
    },
    {
        front: "What is the condition for a critical point in multivariable optimization?",
        back: "∇f(x, y) = <0, 0> (The gradient vector is zero) OR the gradient is undefined."
    },
    {
        front: "How do Lagrange Multipliers work geometrically?",
        back: "They find where the level curves of the objective function f are tangent to the constraint curve g (i.e., ∇f = λ∇g)."
    }
];

const REVISION_STRATEGY = [
    {
        title: "Active Recall Protocol",
        desc: "Don't just re-read notes. Close your eyes and attempt to derive the Jacobian for spherical coordinates from scratch. If you fail, peek, then try again in 10 minutes."
    },
    {
        title: "Feynman Technique",
        desc: "Explain 'Directional Derivative' to an imaginary 5-year-old. If you use jargon like 'dot product' without defining it, you don't understand it simply enough."
    },
    {
        title: "Interleaved Practice",
        desc: "Mix Jacobian problems with Optimization problems. Don't do blocks of the same type. This mimics the exam environment."
    }
];

export default function RevisionResultsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif pb-24">

            {/* Header */}
            <header className="border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-[#020617]/50 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/revise" className="text-sm font-bold font-sans opacity-60 hover:opacity-100 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 rotate-180" /> Change Syllabus
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
                            <Zap className="w-3 h-3" />
                            Plan Ready
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">

                {/* Hero / Overview */}
                <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6">
                        <h1 className="text-5xl font-bold leading-tight">
                            Personalized <br /> Revision Strategy
                        </h1>
                        <p className="text-xl opacity-70 font-light leading-relaxed">
                            We've analyzed your syllabus targets. Your revision should focus heavily on <span className="text-purple-600 dark:text-purple-400 font-medium">Vector Calculus nuances</span> and <span className="text-blue-600 dark:text-blue-400 font-medium">Optimization Constraints</span>.
                        </p>

                        <div className="flex gap-4 pt-4">
                            <Button asChild className="rounded-full bg-black dark:bg-white text-white dark:text-black font-sans font-bold h-12 px-8">
                                <a href="#flashcards">Start Active Recall</a>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full font-sans font-bold h-12 px-8">
                                <Link href="/tests/take">Take Mock Test</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Pomodoro Timer Widget */}
                    <div className="relative">
                        <PomodoroTimer />
                    </div>
                </div>

                <hr className="border-black/5 dark:border-white/5" />

                {/* Priority Topics Analysis */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Target className="w-8 h-8 opacity-20" />
                        <h2 className="text-3xl font-bold">Priority Gap Analysis</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {PRIORITY_TOPICS.map((unit, i) => (
                            <div key={i} className="space-y-6">
                                <h3 className="font-sans text-sm font-bold uppercase tracking-widest opacity-50 border-b border-black/10 dark:border-white/10 pb-2">
                                    {unit.unit}
                                </h3>
                                <div className="space-y-4">
                                    {unit.topics.map((topic, j) => (
                                        <div key={j} className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-lg">{topic.name}</h4>
                                                <span className={`text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${topic.gap === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        topic.gap === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {topic.gap} Gap
                                                </span>
                                            </div>
                                            <p className="text-sm opacity-60 leading-relaxed font-sans">
                                                <span className="font-bold">Analysis:</span> {topic.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-black/5 dark:border-white/5" />

                {/* Revision Strategy */}
                <section className="space-y-8">
                    <div className="flex items-center gap-4">
                        <Brain className="w-8 h-8 opacity-20" />
                        <h2 className="text-3xl font-bold">Recommended Protocol</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {REVISION_STRATEGY.map((strat, i) => (
                            <div key={i} className="bg-purple-50/50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                                <h3 className="font-bold text-lg mb-3 text-purple-900 dark:text-purple-300">{strat.title}</h3>
                                <p className="text-sm leading-relaxed opacity-80 font-sans">
                                    {strat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-black/5 dark:border-white/5" />

                {/* Interactive Flashcards */}
                <section id="flashcards" className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BookOpen className="w-8 h-8 opacity-20" />
                            <h2 className="text-3xl font-bold">Concept Deck</h2>
                        </div>
                        <span className="font-sans text-xs font-bold uppercase tracking-widest opacity-40">
                            {FLASHCARDS.length} Cards
                        </span>
                    </div>

                    {/* Horizontal Scroll Deck */}
                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
                        {FLASHCARDS.map((card, i) => (
                            <div key={i} className="snap-center shrink-0 w-[350px] md:w-[400px]">
                                <FlashcardItem card={card} index={i} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-10 text-center space-y-6">
                    <h2 className="text-3xl font-bold">Ready to Validate?</h2>
                    <p className="opacity-70 font-light max-w-xl mx-auto text-lg">
                        You've reviewed the concepts and gaps. Now, put your knowledge to the test under timed conditions.
                    </p>
                    <Button asChild size="lg" className="rounded-full px-10 h-14 text-lg font-bold font-sans bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900 border border-transparent">
                        <Link href="/tests/take">
                            Start 10-Question Quiz <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>

            </main>
        </div>
    );
}

function FlashcardItem({ card, index }: { card: { front: string, back: string }, index: number }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className="group perspective-1000 h-80 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative preserve-3d"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg group-hover:border-purple-500/30 transition-colors">
                    <span className="absolute top-6 left-6 text-xs font-bold opacity-30 font-sans tracking-widest uppercase">Card {index + 1}</span>
                    <p className="font-medium text-xl leading-relaxed">{card.front}</p>
                    <span className="absolute bottom-6 text-xs font-bold text-purple-500 font-sans uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to Flip</span>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 backface-hidden bg-[#0d0d2e] dark:bg-purple-950 border border-purple-500/30 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <p className="text-lg leading-relaxed text-purple-100">{card.back}</p>
                </div>
            </motion.div>
        </div>
    );
}

function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isWork, setIsWork] = useState(true); // true = work, false = break

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Auto-switch mode
            if (isWork) {
                setTimeLeft(5 * 60); // 5 min break
                setIsWork(false);
            } else {
                setTimeLeft(25 * 60); // 25 min work
                setIsWork(true);
            }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isActive, timeLeft, isWork]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setIsWork(true);
        setTimeLeft(25 * 60);
    };

    return (
        <div className="bg-black dark:bg-white text-white dark:text-black rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center gap-2 opacity-60">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest font-sans">
                        {isWork ? 'Focus Session' : 'Break Time'}
                    </span>
                </div>

                <div className="text-7xl font-bold tabular-nums tracking-tight font-sans">
                    {formatTime(timeLeft)}
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={toggleTimer}
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/10 border-white/20 text-white dark:text-black dark:bg-black/10 dark:border-black/20 hover:bg-white/20 w-12 h-12"
                    >
                        {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                    </Button>
                    <Button
                        onClick={resetTimer}
                        variant="outline"
                        size="icon"
                        className="rounded-full bg-white/10 border-white/20 text-white dark:text-black dark:bg-black/10 dark:border-black/20 hover:bg-white/20 w-12 h-12"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Progress Ring Background Effect (Simplified) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 opacity-50" />
        </div>
    )
}
