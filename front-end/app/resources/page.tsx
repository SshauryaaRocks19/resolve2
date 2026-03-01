'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink, Search, Loader2, Video, Globe, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Resource {
    title: string;
    url: string;
    platform: string;
    conceptual_summary: string;
}

export default function ResourcesPage() {
    const [topic, setTopic] = useState('');
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setSearched(true);

        try {
            const res = await fetch('/api/curator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: topic.trim() }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Failed to fetch resources');
            }

            // The API returns { result: "<json string>" }
            // Parse the result string as JSON
            let parsed: Resource[];
            if (typeof data.result === 'string') {
                parsed = JSON.parse(data.result);
            } else {
                parsed = data.result;
            }

            if (!Array.isArray(parsed)) {
                throw new Error('Unexpected response format');
            }

            setResources(parsed);
        } catch (err: any) {
            console.error('Curator fetch error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-500 font-serif">

            {/* Header */}
            <header className="border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
                <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10 font-sans">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold tracking-wide">Deep Concept Resources</h1>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">

                {/* Search Section */}
                <section className="space-y-6">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans">
                            AI-Curated Learning Path
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Find the best resources<br />for any topic.
                        </h2>
                        <p className="text-xl opacity-70 leading-relaxed">
                            Powered by AI with Google Search grounding — curating first-principle resources from Khan Academy, MIT OCW, 3Blue1Brown, and more.
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Multivariable Calculus, Quantum Mechanics, Graph Theory..."
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-lg font-sans placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading || !topic.trim()}
                                className="h-[58px] px-8 rounded-2xl font-sans font-bold text-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Curating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Curate
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Loading State */}
                <AnimatePresence mode="wait">
                    {loading && (
                        <motion.section
                            key="loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6 space-y-4 animate-pulse">
                                        <div className="h-5 w-3/4 rounded bg-black/10 dark:bg-white/10" />
                                        <div className="h-3 w-1/2 rounded bg-black/5 dark:bg-white/5" />
                                        <div className="space-y-2 pt-2">
                                            <div className="h-3 w-full rounded bg-black/5 dark:bg-white/5" />
                                            <div className="h-3 w-5/6 rounded bg-black/5 dark:bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <motion.section
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                                <p className="text-lg font-medium text-red-700 dark:text-red-400 font-sans">{error}</p>
                                <Button
                                    variant="outline"
                                    onClick={handleSearch as any}
                                    className="font-sans mt-2 border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </motion.section>
                    )}

                    {/* Results */}
                    {!loading && !error && resources.length > 0 && (
                        <motion.section
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">
                                    Resources for <span className="text-blue-600 dark:text-blue-400">{topic}</span>
                                </h3>
                                <span className="text-sm font-sans opacity-50">
                                    {resources.length} resource{resources.length !== 1 ? 's' : ''} found
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.map((resource, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <ResourceCard resource={resource} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Empty State (before search) */}
                    {!loading && !error && !searched && (
                        <motion.section
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="inline-flex flex-col items-center gap-4 opacity-40">
                                <BookOpen className="w-16 h-16" />
                                <p className="text-xl font-medium font-sans">Enter a topic above to discover curated resources</p>
                            </div>
                        </motion.section>
                    )}

                    {/* No results */}
                    {!loading && !error && searched && resources.length === 0 && (
                        <motion.section
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="inline-flex flex-col items-center gap-4 opacity-50">
                                <Search className="w-12 h-12" />
                                <p className="text-lg font-sans">No resources found. Try a different topic.</p>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function getPlatformIcon(platform: string) {
    const p = platform.toLowerCase();
    if (p.includes('youtube') || p.includes('3blue1brown') || p.includes('video')) {
        return <Video className="w-4 h-4" />;
    }
    if (p.includes('khan') || p.includes('mit') || p.includes('book') || p.includes('textbook')) {
        return <BookOpen className="w-4 h-4" />;
    }
    return <Globe className="w-4 h-4" />;
}

function getPlatformColor(platform: string) {
    const p = platform.toLowerCase();
    if (p.includes('youtube') || p.includes('3blue1brown')) {
        return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200/50 dark:border-red-800/30' };
    }
    if (p.includes('khan')) {
        return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200/50 dark:border-green-800/30' };
    }
    if (p.includes('mit')) {
        return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200/50 dark:border-orange-800/30' };
    }
    if (p.includes('reddit')) {
        return { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-500 dark:text-orange-400', border: 'border-orange-200/50 dark:border-orange-800/30' };
    }
    return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200/50 dark:border-blue-800/30' };
}

function ResourceCard({ resource }: { resource: Resource }) {
    const color = getPlatformColor(resource.platform);

    return (
        <div className={`flex flex-col h-full rounded-xl border ${color.border} bg-white/50 dark:bg-white/5 backdrop-blur-sm transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg hover:-translate-y-0.5`}>
            <div className="p-6 flex-1 space-y-4">
                {/* Platform Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-sans ${color.bg} ${color.text}`}>
                    {getPlatformIcon(resource.platform)}
                    {resource.platform}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold leading-snug">{resource.title}</h3>

                {/* Summary */}
                <p className="text-sm opacity-60 leading-relaxed font-sans">{resource.conceptual_summary}</p>
            </div>

            {/* Action */}
            <div className="px-6 pb-6 pt-2">
                <Button className="w-full font-sans gap-2" variant="outline" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Open Resource <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </div>
        </div>
    );
}
