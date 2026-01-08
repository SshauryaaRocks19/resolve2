'use client';

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StudyHero() {
    return (
        <section className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-[#020617] px-4 py-20 text-center transition-colors duration-500">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Mesh gradients - Light: Monochrome/Gray | Dark: Deep Neon */}
                <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gray-200/50 dark:bg-blue-900/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[4000ms]" />
                <div className="absolute bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-gray-300/50 dark:bg-purple-900/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[6000ms] delay-1000" />
                <div className="absolute top-[40%] left-[50%] h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-100/50 dark:bg-indigo-900/20 blur-[90px] mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-10">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="font-serif text-4xl leading-tight text-black dark:text-white md:text-6xl lg:text-7xl drop-shadow-sm transition-colors duration-300"
                >
                    What do you wanna<br className="hidden md:block" /> study today, Sshauryaa?
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex w-full max-w-2xl items-center gap-4"
                >
                    {/* Search Bar - Glassmorphism (Adaptive) */}
                    <div className="group relative flex-1">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-gray-400/30 to-gray-600/30 dark:from-blue-500/20 dark:to-purple-500/20 opacity-50 blur transition duration-500 group-hover:opacity-100" />

                        <div className="relative flex h-16 w-full items-center rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-2 backdrop-blur-md transition-all focus-within:bg-white dark:focus-within:bg-white/10 focus-within:shadow-lg dark:focus-within:shadow-none hover:bg-white/90 dark:hover:bg-white/10">
                            <input
                                type="text"
                                placeholder="Enter topic name."
                                className="flex-1 bg-transparent px-6 text-lg text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white/40 focus:outline-none font-light tracking-wide"
                            />
                            <Link href="/resources">
                                <Button
                                    className="h-12 w-24 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-md transition-all hover:scale-105 font-sans"
                                >
                                    Go!
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Button - Glassmorphism Dropdown (Adaptive) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="group relative h-16 w-16 shrink-0 rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-0 text-black dark:text-white backdrop-blur-md transition-all hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 data-[state=open]:bg-black/5 dark:data-[state=open]:bg-white/10 data-[state=open]:scale-105"
                            >
                                <Filter className="h-6 w-6 opacity-70 transition-opacity group-hover:opacity-100" />
                                <div className="absolute inset-0 -z-10 rounded-full bg-black/5 dark:bg-white/5 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80 bg-white/95 dark:bg-[#0a0a2a]/95 backdrop-blur-xl border-black/10 dark:border-white/10 text-black dark:text-white p-4 space-y-4 shadow-2xl rounded-xl">
                            <DropdownMenuLabel className="text-lg font-serif">Study Preferences</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Exact Syllabus</label>
                                <Input
                                    className="bg-gray-50 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-black/20 dark:focus-visible:ring-blue-500/50"
                                    placeholder="Paste syllabus/topics..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Exam Name</label>
                                <Input
                                    className="bg-gray-50 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-black/20 dark:focus-visible:ring-blue-500/50"
                                    placeholder="e.g. JEE Mains, Final Term..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Level</label>
                                    <select className="flex h-10 w-full rounded-md border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-black dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="beginner" className="dark:bg-[#0a0a2a]">Beginner</option>
                                        <option value="intermediate" className="dark:bg-[#0a0a2a]">Intermediate</option>
                                        <option value="advanced" className="dark:bg-[#0a0a2a]">Advanced</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Depth</label>
                                    <select className="flex h-10 w-full rounded-md border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-black dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50">
                                        <option value="overview" className="dark:bg-[#0a0a2a]">Overview</option>
                                        <option value="comprehensive" className="dark:bg-[#0a0a2a]">Comprehensive</option>
                                        <option value="master" className="dark:bg-[#0a0a2a]">Master</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-500 dark:text-white/70 uppercase tracking-wider">Time Left</label>
                                <Input
                                    className="bg-gray-50 dark:bg-white/5 border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20 focus-visible:ring-black/20 dark:focus-visible:ring-blue-500/50"
                                    placeholder="e.g. 2 days, 1 week..."
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>
            </div>
        </section>
    );
}
