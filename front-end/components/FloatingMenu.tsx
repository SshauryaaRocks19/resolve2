'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';

interface FloatingMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuVariants: Variants = {
    closed: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    open: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
};

const items = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '#' },
    { title: 'Revise', href: '/revise' },
    { title: 'Tests', href: '/tests' },
    { title: 'Prerequisite Gap Mapper', href: '/gap-analysis' },
    { title: 'Plan reality check', href: '#' },
    { title: 'Prioritization engine', href: '/prioritization' },
];

export function FloatingMenu({ isOpen, onClose }: FloatingMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={onClose}
                    />

                    {/* Menu Container */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        className="absolute top-16 left-4 z-50 min-w-[200px] overflow-hidden rounded-xl border bg-popover p-2 shadow-lg backdrop-blur-md"
                    >
                        <nav className="flex flex-col gap-1">
                            {items.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                    onClick={onClose}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
