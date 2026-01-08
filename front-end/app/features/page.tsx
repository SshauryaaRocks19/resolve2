'use client';

import { motion } from 'framer-motion';
import {
    BrainCircuit,
    Zap,
    BookOpen,
    Target,
    ArrowRight,
    TrendingUp,
    Layers,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const FEATURES = [
    {
        id: 'revision',
        title: "Smart Revision Planning",
        icon: BrainCircuit,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        desc: "Transforming chaos into clarity.",
        details: [
            "Knowledge Graph construction from fragmented notes.",
            "Algorithmically prioritized Gap Analysis.",
            "Integrated Pomodoro Focus Timer.",
            "Cognitive Load Management via tiered gaps."
        ],
        link: "/revise"
    },
    {
        id: 'tests',
        title: "Adaptive Testing Engine",
        icon: Target,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        desc: "Validation under pressure.",
        details: [
            "Dynamic question generation based on syllabus.",
            "Real-time stopwatch & pressure simulation.",
            "Deep Concept vs. Calculation tagging.",
            "Precise performance breakdown (Marks/Time)."
        ],
        link: "/tests"
    },
    {
        id: 'resources',
        title: "Curated Knowledge Base",
        icon: BookOpen,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        desc: "No noise. Only signal.",
        details: [
            "Gold-standard lecture series (MIT, Khan Academy).",
            "Textbook mapping (Spivak, Apostol).",
            "Topic-specific Deep Dives.",
            "Visual Intuition builders (3Blue1Brown)."
        ],
        link: "/resources"
    }
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-32">

                {/* Hero */}
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-md"
                    >
                        <Layers className="w-4 h-4 opacity-60" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60 font-sans">The Ecosystem</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tight"
                    >
                        Built for <br className="hidden md:block" /> Mastery.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        A unified suite of tools designed to accelerate high-level conceptual understanding in complex STEM fields.
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>

                {/* Closing */}
                <div className="text-center space-y-8 pt-10">
                    <h2 className="text-3xl font-bold">Integrated Perfection</h2>
                    <p className="opacity-60 font-light max-w-md mx-auto">
                        Each tool feeds into the next. Tests reveal gaps &rarr; Gaps drive Revision &rarr; Revision utilizes Resources.
                    </p>
                    <Button asChild size="lg" className="h-14 px-10 rounded-full bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-transform font-sans font-bold text-lg">
                        <Link href="/">Start Learning</Link>
                    </Button>
                </div>

            </main>
        </div>
    );
}

function FeatureCard({ feature, index }: { feature: any, index: number }) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="group relative h-full"
        >
            <div className={`h-full bg-white/50 dark:bg-white/5 backdrop-blur-md border ${feature.border} rounded-3xl p-8 flex flex-col gap-6 hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2`}>

                {/* Header */}
                <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color}`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold leading-tight group-hover:text-purple-500 transition-colors">{feature.title}</h3>
                        <p className="text-lg opacity-60 font-light italic mt-1">{feature.desc}</p>
                    </div>
                </div>

                {/* List */}
                <div className="flex-grow space-y-3">
                    {feature.details.map((detail: string, j: number) => (
                        <div key={j} className="flex gap-3">
                            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${feature.color.replace('text-', 'bg-')}`} />
                            <p className="text-sm opacity-80 leading-relaxed font-sans">{detail}</p>
                        </div>
                    ))}
                </div>

                {/* Action */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <Link href={feature.link} className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${feature.color} opacity-60 group-hover:opacity-100 hover:gap-3 transition-all font-sans`}>
                        Launch <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
