'use client';

import 'katex/dist/katex.min.css';

/**
 * Renders text that may contain LaTeX math expressions.
 * Supports both inline ($...$) and display ($$...$$) math.
 * Falls back to plain text if no math expressions are found.
 */
export default function MathText({ text, className }: { text: string; className?: string }) {
    // Split text on LaTeX delimiters and render accordingly
    // Supports: $$...$$ (display), $...$ (inline), \(...\) (inline), \[...\] (display)
    const parts = parseLatex(text);

    return (
        <span className={className}>
            {parts.map((part, i) => {
                if (part.type === 'math-display') {
                    return (
                        <span
                            key={i}
                            className="block my-2"
                            dangerouslySetInnerHTML={{
                                __html: renderKatex(part.content, true),
                            }}
                        />
                    );
                }
                if (part.type === 'math-inline') {
                    return (
                        <span
                            key={i}
                            dangerouslySetInnerHTML={{
                                __html: renderKatex(part.content, false),
                            }}
                        />
                    );
                }
                return <span key={i}>{part.content}</span>;
            })}
        </span>
    );
}

type Part = { type: 'text' | 'math-inline' | 'math-display'; content: string };

function parseLatex(text: string): Part[] {
    const parts: Part[] = [];
    // Match $$...$$, $...$, \[...\], \(...\)
    const regex = /\$\$([\s\S]*?)\$\$|\$((?!\s)[^$]*?(?<!\s))\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }

        if (match[1] !== undefined) {
            // $$...$$ display math
            parts.push({ type: 'math-display', content: match[1] });
        } else if (match[2] !== undefined) {
            // $...$ inline math
            parts.push({ type: 'math-inline', content: match[2] });
        } else if (match[3] !== undefined) {
            // \[...\] display math
            parts.push({ type: 'math-display', content: match[3] });
        } else if (match[4] !== undefined) {
            // \(...\) inline math
            parts.push({ type: 'math-inline', content: match[4] });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    // If no math was found, return the original text
    if (parts.length === 0) {
        parts.push({ type: 'text', content: text });
    }

    return parts;
}

function renderKatex(latex: string, displayMode: boolean): string {
    try {
        // Dynamic import workaround — katex is already loaded via CSS import
        const katex = require('katex');
        return katex.renderToString(latex, {
            displayMode,
            throwOnError: false,
            trust: true,
        });
    } catch {
        return latex;
    }
}
