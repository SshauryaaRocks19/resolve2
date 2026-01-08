'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, ExternalLink, PlayCircle, Video } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ResourcesPage() {
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

            <main className="mx-auto max-w-6xl px-6 py-12 space-y-20">

                {/* Hero / Recommendation Section */}
                <section className="space-y-8">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <span className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-sans">Curated Learning Path</span>
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">Multivariable Calculus<br />(Derivatives & Applications)</h2>
                        <p className="text-xl opacity-70 leading-relaxed">
                            Master the geometry of high-dimensional change. These resources focus on intuitive understanding over rote calculation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Featured Playlist */}
                        <div className="group relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-1 transition-all hover:shadow-2xl hover:scale-[1.01]">
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                                <iframe
                                    src="https://www.youtube.com/embed/videoseries?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7"
                                    title="Multivariable Calculus Playlist"
                                    className="absolute inset-0 w-full h-full"
                                    allowFullScreen
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <PlayCircle className="fill-red-500 text-white w-6 h-6" />
                                    The "Gold Standard" Playlist
                                </h3>
                                <p className="opacity-70 mb-4">Comprehensive visual guide to multivariable calculus concepts.</p>
                                <Button className="w-full font-sans gap-2" asChild>
                                    <a href="https://www.youtube.com/playlist?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7" target="_blank">
                                        Open on YouTube <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        {/* Featured Book */}
                        <div className="group rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-8 flex flex-col justify-between transition-all hover:shadow-2xl hover:bg-gray-100 dark:hover:bg-white/10">
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-2">Calculus on Manifolds</h3>
                                    <p className="text-xl font-medium opacity-60">by Michael Spivak</p>
                                </div>
                                <p className="text-lg leading-relaxed opacity-80">
                                    A modern classic. This text serves as a rigorous bridge between standard calculus and differential geometry/topology. Essential for deep theoretical understanding.
                                </p>
                            </div>
                            <Button className="w-full mt-8 font-sans gap-2" variant="outline" asChild>
                                <a href="https://www.cimat.mx/~gil/docencia/2013/topologia_variedades/spivak-calculus-on-manifolds.pdf" target="_blank">
                                    Read PDF <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </section>

                <hr className="border-black/10 dark:border-white/10" />

                {/* Topics Grid */}
                <section className="space-y-12">
                    <h2 className="text-3xl font-bold text-center">Topic-Wise Deep Dives</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* 1. Partial Derivatives & Gradient */}
                        <ResourceCard
                            title="Partial Derivatives & The Gradient"
                            description="Understanding change in multiple directions and the direction of steepest ascent."
                            items={[
                                { label: "Visualizing Partial Derivatives (Khan Academy)", url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/partial-derivative-and-gradient-articles/a/partial-derivatives-and-gradient-review" },
                                { label: "Gradient Descent Intuition (3Blue1Brown)", url: "https://www.3blue1brown.com/lessons/gradient-descent" },
                                { label: "The Gradient Vector (MIT OCW)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-b-chain-rule-gradient-and-directional-derivatives/" }
                            ]}
                        />

                        {/* 2. Divergence & Curl */}
                        <ResourceCard
                            title="Divergence, Curl & Laplacian"
                            description="The language of fluid flow and Maxwell's equations. Measuring sources, sinks, and rotation."
                            items={[
                                { label: "Divergence & Curl Intuition (3Blue1Brown)", url: "https://www.youtube.com/watch?v=rB83DpBJQsE" },
                                { label: "Understanding the Laplacian", url: "https://betterexplained.com/articles/vector-calculus-understanding-circulation-and-curl/" }, // Placeholder for high quality article
                                { label: "Maxwell's Equations Visualized", url: "https://www.youtube.com/watch?v=rB83DpBJQsE" }
                            ]}
                        />

                        {/* 3. The Jacobian */}
                        <ResourceCard
                            title="The Jacobian Matrix"
                            description="Local linearization of vector-valued functions and changing variables in integration."
                            items={[
                                { label: "The Jacobian Matrix (Khan Academy)", url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/jacobian/v/the-jacobian-matrix" },
                                { label: "Change of Variables (MIT OCW)", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/3.-double-integrals-and-line-integrals-in-the-plane/" },
                                { label: "Jacobian Prerequisite Gap (Video)", url: "https://www.youtube.com/watch?v=bohL918kXQk" }
                            ]}
                        />

                        {/* 4. Optimization */}
                        <ResourceCard
                            title="Optimization & Lagrange Multipliers"
                            description="Finding max/min values under constraints. The geometry of tangency."
                            items={[
                                { label: "Lagrange Multipliers Visualized (3Blue1Brown)", url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/constrained-optimization/a/lagrange-multipliers-single-constraint" },
                                { label: "Constrained Optimization Articles", url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives" },
                                { label: "Hessian Matrix & Second Derivative Test", url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/optimizing-multivariable-functions/a/second-partial-derivative-test" }
                            ]}
                        />

                        {/* 5. Linearization & Applications */}
                        <ResourceCard
                            title="Linearization & Approximations"
                            description="Tangent planes and quadratic approximations using the Taylor expansion."
                            items={[
                                { label: "Tangent Planes (Khan Academy)", url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/tangent-planes-and-local-linearization/a/tangent-planes" },
                                { label: "Quadratic Approximations", url: "https://www.khanacademy.org/math/multivariable-calculus/applications-of-multivariable-derivatives/quadratic-approximations/a/quadratic-approximation" },
                                { label: "Multivariable Chain Rule", url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/multivariable-chain-rule/v/multivariable-chain-rule" }
                            ]}
                        />

                        {/* 6. Vector Functions */}
                        <ResourceCard
                            title="Vector-Valued Functions"
                            description="Differentiating functions that map to vectors. Parametric curves and motion."
                            items={[
                                { label: "Parametric Curves Derivatives", url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/differentiating-vector-valued-functions/a/derivatives-of-vector-valued-functions" },
                                { label: "Curvature & Torsion", url: "https://www.khanacademy.org/math/multivariable-calculus/multivariable-derivatives/curvature/v/curvature-formula-intuition" },
                                { label: "Motion in 3D Space", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/1.-vectors-and-matrices/part-c-parametric-equations-for-curves/" }
                            ]}
                        />

                    </div>
                </section>
            </main>
        </div>
    );
}

function ResourceCard({ title, description, items }: { title: string, description: string, items: { label: string, url: string }[] }) {
    return (
        <div className="flex flex-col h-full rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-lg">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-60 mb-6 flex-1">{description}</p>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors group/link"
                    >
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {item.label.includes("Video") || item.label.includes("3Blue1Brown") || item.label.includes("Khan") ? <Video className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-medium group-hover/link:underline decoration-black/20 dark:decoration-white/20 underline-offset-4">{item.label}</span>
                    </a>
                ))}
            </div>
        </div>
    )
}
