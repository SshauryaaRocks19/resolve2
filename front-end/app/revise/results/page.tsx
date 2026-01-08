'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, PenTool, CheckCircle, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Flashcard {
    front: string;
    back: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct: string;
    explanation: string;
}

// HARDCODED DATA
const FLASHCARDS: Flashcard[] = [
    {
        front: "What is the core definition of overfitting?",
        back: "It is the phenomenon where a model performs well on training data but does not generalise well because it has detected patterns in the noise or sampling chance of the data."
    },
    {
        front: "Why are Decision Trees considered unstable?",
        back: "Because they are very sensitive to small variations in the training data; even removing one instance or rotating the dataset can lead to a completely different tree structure."
    },
    {
        front: "What is the vanishing gradient problem in deep RNNs?",
        back: "During backpropagation through time, gradients tend to get smaller as they move to lower layers, causing the weights to remain unchanged and preventing the network from learning."
    },
    {
        front: "What are the three components of a model's generalisation error?",
        back: "1. Bias (wrong assumptions); 2. Variance (sensitivity to training noise); and 3. Irreducible error (noisiness of the data itself)."
    },
    {
        front: "How do LSTM and GRU cells address RNN weaknesses?",
        back: "They use gates to manage long-term memory, allowing the network to learn what to store, throw away, or read, which helps combat fading memory and vanishing gradients."
    }
];

const QUIZ: QuizQuestion[] = [
    {
        question: "What phenomenon is occurring when a model performs excellently on training data but fails to generalise to new instances?",
        options: ["Underfitting", "Overfitting", "Regularisation", "Feature extraction"],
        correct: "Overfitting",
        explanation: "Overfitting happens when the model learns the noise in the training data rather than the underlying pattern."
    },
    {
        question: "Which algorithm is notably sensitive to small variations in the training set, such as the removal of a single instance?",
        options: ["Linear Regression", "Support Vector Machines", "Decision Trees", "Logistic Regression"],
        correct: "Decision Trees",
        explanation: "Decision Trees splits are highly dependent on the specific data points, making them unstable."
    },
    {
        question: "In deep neural networks, what is the result of the vanishing gradient problem?",
        options: ["The model parameters settle into a global minimum too quickly.", "Lower layer weights are left virtually unchanged during training.", "The algorithm diverges due to excessively large weight updates.", "The neurons stop outputting anything other than 1."],
        correct: "Lower layer weights are left virtually unchanged during training.",
        explanation: "Gradients become so small that the weight updates are negligible for early layers."
    },
    {
        question: "Why are Decision Trees described as \"non-parametric\" models?",
        options: ["They do not use any mathematical parameters.", "They are based on fixed linear functions.", "The number of parameters is not determined prior to training.", "They are immune to overfitting."],
        correct: "The number of parameters is not determined prior to training.",
        explanation: "Non-parametric means the model structure grows with the data rather than having a fixed set of parameters."
    },
    {
        question: "What is a primary cause of overfitting in Machine Learning?",
        options: ["The model is too simple for the underlying data structure.", "The model is too complex relative to the amount and noisiness of data.", "The training set is too large for the algorithm to process.", "The learning rate is set too low."],
        correct: "The model is too complex relative to the amount and noisiness of data.",
        explanation: "Complex models can memorize noise, leading to overfitting."
    },
    {
        question: "Which problem arises when training an RNN over many time steps, making the unrolled network very deep?",
        options: ["Axis sensitivity", "Vanishing or exploding gradients", "Internal Covariate Shift", "Data snooping bias"],
        correct: "Vanishing or exploding gradients",
        explanation: "Backpropagating through many time steps is mathematically equivalent to a very deep network."
    },
    {
        question: "How can regularisation affect a model's performance?",
        options: ["It increases the risk of the model detecting patterns in noise.", "It makes the model more complex to improve training accuracy.", "It constrains the model to make it simpler and reduce overfitting.", "It eliminates the need for a validation set."],
        correct: "It constrains the model to make it simpler and reduce overfitting.",
        explanation: "Regularisation adds a penalty for complexity."
    },
    {
        question: "Which technique is used to combat the vanishing gradient problem by allowing the model to preserve important information across many time steps?",
        options: ["Truncated backpropagation", "Using LSTM or GRU cells", "Global average pooling", "Zero padding"],
        correct: "Using LSTM or GRU cells",
        explanation: "LSTMs/GRUs have internal states specifically designed to maintain long-term dependencies."
    },
    {
        question: "What is the effect of rotating a training set by 45 degrees when using a Decision Tree?",
        options: ["It improves the generalisation of the model.", "It may result in an unnecessarily convoluted decision boundary.", "It has no effect because Decision Trees are rotation-invariant.", "It reduces the depth required for the tree."],
        correct: "It may result in an unnecessarily convoluted decision boundary.",
        explanation: "Decision trees split data along orthogonal axes (x=k, y=k), so diagonal boundaries are jagged and complex."
    },
    {
        question: "If a model has a low training error but a high generalisation error, it is likely:",
        options: ["Underfitting", "Overfitting", "Balanced", "Perfectly trained"],
        correct: "Overfitting",
        explanation: "High discrepancy between training and test error is the definition of overfitting."
    }
];

export default function RevisionResultsPage() {
    // Quiz State (Separate logic for the results page)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showQuizResults, setShowQuizResults] = useState(false);

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <header className="space-y-4 text-center md:text-left border-b pb-8">
                    <Link href="/revise" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-bold tracking-wide uppercase hover:bg-muted/80 mb-4">
                        ← Back to Upload
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                        YOUR <span className="text-purple-500">RES-KIT</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-2xl">
                        Based on your weak spots in <strong className="text-foreground">Machine Learning Fundamentals, Decision Trees, and RNNs</strong>.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-16"
                    >
                        {/* Flashcards Section */}
                        <div className="space-y-6">
                            <h3 className="text-3xl font-bold flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-purple-500" />
                                Concept Flashcards
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {FLASHCARDS.map((card, idx) => (
                                    <FlashcardItem key={idx} card={card} index={idx} />
                                ))}
                            </div>
                        </div>

                        {/* Quiz Section */}
                        <div className="space-y-6 max-w-4xl">
                            <h3 className="text-3xl font-bold flex items-center gap-3">
                                <PenTool className="w-8 h-8 text-green-500" />
                                Mastery Quiz
                            </h3>
                            <div className="space-y-6">
                                {QUIZ.map((q, idx) => (
                                    <div key={idx} className="bg-card border border-border p-6 rounded-xl shadow-sm">
                                        <p className="font-medium text-lg mb-4">{idx + 1}. {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    onClick={() => !showQuizResults && setSelectedAnswers(prev => ({ ...prev, [idx]: opt }))}
                                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${showQuizResults
                                                        ? opt === q.correct
                                                            ? 'bg-green-500/10 border-green-500 text-green-500 font-medium'
                                                            : selectedAnswers[idx] === opt
                                                                ? 'bg-destructive/10 border-destructive text-destructive'
                                                                : 'opacity-50 border-border'
                                                        : selectedAnswers[idx] === opt
                                                            ? 'bg-purple-500/10 border-purple-500 text-purple-500 ring-1 ring-purple-500'
                                                            : 'hover:bg-muted border-border hover:border-purple-200'
                                                        }`}
                                                >
                                                    <span>{opt}</span>
                                                    {showQuizResults && opt === q.correct && <CheckCircle className="w-5 h-5 text-green-500" />}
                                                </div>
                                            ))}
                                        </div>
                                        {showQuizResults && (
                                            <div className="mt-4 text-sm text-foreground bg-muted/80 p-4 rounded-lg border-l-4 border-green-500">
                                                <span className="font-bold block mb-1">Explanation:</span> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="pt-8">
                                    {!showQuizResults ? (
                                        <Button onClick={() => setShowQuizResults(true)} className="w-full md:w-auto px-8 py-6 text-lg font-bold bg-green-600 hover:bg-green-700">
                                            Check All Answers
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => {
                                            setShowQuizResults(false);
                                            setSelectedAnswers({});
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }} className="w-full md:w-auto px-8 py-6 text-lg">
                                            Reset Quiz
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function FlashcardItem({ card, index }: { card: Flashcard; index: number }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className="group perspective-1000 h-64 cursor-pointer"
            onClick={() => setFlipped(!flipped)}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-full h-full relative preserve-3d"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-card border border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm group-hover:shadow-md transition-shadow group-hover:border-purple-500/50">
                    <span className="absolute top-4 left-4 text-xs font-bold text-purple-500 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">Card {index + 1}</span>
                    <p className="font-semibold text-xl leading-relaxed">{card.front}</p>
                    <span className="absolute bottom-4 text-xs text-muted-foreground opacity-50">Click to flip</span>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 rounded-2xl flex items-center justify-center text-center shadow-lg"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <p className="font-medium text-lg leading-relaxed">{card.back}</p>
                </div>
            </motion.div>
        </div>
    );
}
