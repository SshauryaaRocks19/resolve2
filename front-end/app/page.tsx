'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Dither from '@/components/Dither';
import SplitText from '@/components/SplitText';
import StudyHero from '@/components/StudyHero';
import ProgressSection from '@/components/ProgressSection';

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  // Light: oklch(0.99 0.01 240) -> ~[0.99, 0.99, 1.0] (Very light blue-ish white)
  // Dark: oklch(0.15 0.05 270) -> ~[0.1, 0.08, 0.16] (Deep purple/blue)
  const waveColor = mounted && theme === 'dark' ? [0.1, 0.08, 0.16] : [0.99, 0.99, 1.0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 -z-10">
          <Dither
            waveColor={waveColor}
            disableAnimation={false}
            enableMouseInteraction
            mouseRadius={1.4}
            colorNum={4}
            pixelSize={2}
            waveAmplitude={1}
            waveFrequency={2}
            waveSpeed={0.05}
          />
        </div>
        <SplitText
          text="WIN"
          className="text-8xl font-black font-sans tracking-tighter text-primary dark:text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] [text-shadow:0_0_2px_rgba(0,0,0,0.5)] dark:[text-shadow:0_0_2px_rgba(255,255,255,0.5)] sm:text-9xl md:text-[10rem]"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <p className="mt-4 text-xl text-muted-foreground font-serif tracking-wide sm:text-2xl">
          over your tests
        </p>
        <button className="mt-8 rounded-full bg-white px-8 py-3 text-lg font-medium text-black transition-transform hover:scale-105 hover:bg-zinc-200">
          Get Started
        </button>
      </section>

      {/* "No more conceptual gaps" Section */}
      <StudyHero />

      {/* Progress Section */}
      <ProgressSection />

      {/* "Continue studying" Section */}
      <section className="flex min-h-[50vh] w-full flex-col items-center justify-center bg-background px-4 py-16 text-center space-y-8">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-serif">
          Continue studying:
        </h2>

        <div className="w-full max-w-4xl space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xl font-medium font-serif opacity-70">Up Next</span>
            <span className="text-2xl font-bold font-serif">Jacobian matrix</span>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/bohL918kXQk?list=PLSQl0a2vh4HC5feHa6Rc5c0wbRTx56nF7"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
  );
}
