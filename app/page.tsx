export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero Section */}
      <section className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="text-8xl font-black tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] sm:text-9xl md:text-[10rem]">
          WIN
        </h1>
        <p className="mt-4 text-xl text-muted-foreground font-serif tracking-wide sm:text-2xl">
          over your tests
        </p>
        <button className="mt-8 rounded-full bg-white px-8 py-3 text-lg font-medium text-black transition-transform hover:scale-105 hover:bg-zinc-200">
          Get Started
        </button>
      </section>

      {/* "No more conceptual gaps" Section */}
      <section className="flex min-h-[50vh] w-full items-center justify-center bg-muted px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          No more Conceptual Gaps!
        </h2>
      </section>

      {/* "Isn't it so simple" Section */}
      <section className="flex min-h-[50vh] w-full items-center justify-center bg-background px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Isn&apos;t it so simple?
        </h2>
      </section>
    </main>
  );
}
