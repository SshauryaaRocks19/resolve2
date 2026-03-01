'use client';

import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders text that may contain LaTeX math expressions.
 * Supports: $$...$$ (display), $...$ (inline), \(...\) (inline), \[...\] (display)
 */
export default function MathText({ text, className }: { text: string; className?: string }) {
    if (!text) return null;

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
    // Order matters: match $$ before $, and \[ before \(
    // Using a simpler, more robust regex
    const regex = /\$\$([\s\S]*?)\$\$|\$([^$]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }

        if (match[1] !== undefined) {
            parts.push({ type: 'math-display', content: match[1] });
        } else if (match[2] !== undefined) {
            parts.push({ type: 'math-inline', content: match[2] });
        } else if (match[3] !== undefined) {
            parts.push({ type: 'math-display', content: match[3] });
        } else if (match[4] !== undefined) {
            parts.push({ type: 'math-inline', content: match[4] });
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    if (parts.length === 0) {
        parts.push({ type: 'text', content: text });
    }

    return parts;
}

function renderKatex(latex: string, displayMode: boolean): string {
    try {
        return katex.renderToString(latex, {
            displayMode,
            throwOnError: false,
            trust: true,
            output: 'html',
        });
    } catch (e) {
        console.warn('KaTeX render error:', e);
        return latex;
    }
}
