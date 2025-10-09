import { CodeTabs } from "@/components/code-tabs";
import { Footer } from "@/components/footer";
import Link from "fumadocs-core/link";
import { ArrowRight, CheckCircle2, Code2, Layers, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">
            Type-safe • Easy • Powerful
          </div>
          <h1 className="text-3xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Internationalization
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The type-safe i18n library for modern React applications. Works
            seamlessly with Next.js, React Router, and TanStack Router.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/docs"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 md:px-8 py-2 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-all hover:shadow-xl flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/damianricobelli/intlize"
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 md:px-8 py-2 md:py-4 rounded-lg text-base md:text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              View on GitHub
            </a>
          </div>

          <CodeTabs />
        </section>

        <section id="features" className="bg-white dark:bg-slate-900 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
              Why Choose Our i18n Library?
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-16 text-lg">
              Everything you need for world-class internationalization
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  100% Type-Safe
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Full TypeScript support with autocomplete for translation
                  keys. Catch missing translations at compile time.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Small Bundle
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Zero dependencies and minimal footprint. Only ship what you
                  need with automatic tree-shaking.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-100 dark:border-violet-900 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-violet-600 dark:bg-violet-500 rounded-lg flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Universal Rendering
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Works seamlessly with server-side, client-side, and static
                  rendering. Full SSR and SSG support.
                </p>
              </div>

              <div className="p-8 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-amber-600 dark:bg-amber-500 rounded-lg flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  No Middleware
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Built on web standards. No custom middleware or complex setup
                  required. Just import and use.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="frameworks" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-4">
              Works With Your Favorite Framework
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-16 text-lg">
              First-class support for the most popular React frameworks
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-900 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Next.js
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Full support for App Router and Pages Router with automatic
                  locale detection and routing.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                  pnpm i @intlize/nextjs
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    React Router
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Seamless integration with React Router v6+ including loader
                  support and dynamic language switching.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                  pnpm i @intlize/react-router
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-cyan-600 dark:bg-cyan-500 rounded-lg flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    TanStack Router
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Type-safe routing meets type-safe i18n. Perfect integration
                  with TanStack Router's latest features.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
                  pnpm i @intlize/tanstack
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl font-bold mb-6 text-slate-900 dark:text-white">
              Start Building Global Apps Today
            </h2>
            <p className="text-xl mb-12 text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Join developers worldwide who are building multilingual
              applications with confidence. Set up in under 5 minutes and scale
              to any language.
            </p>
            <div className="flex items-center justify-center">
              <Link
                href="/docs"
                className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
