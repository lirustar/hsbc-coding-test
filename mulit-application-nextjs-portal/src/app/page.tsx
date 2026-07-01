export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center">
      {/* Hero Section */}
      <main id="main-content" className="flex-1 w-full max-w-6xl mx-auto px-6 pt-16 pb-32">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
            Property Solutions Portal
          </h1>
          <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Access powerful property tools to estimate values and analyze market trends, all in one place.
          </p>
        </div>

        {/* Application Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Property Value Estimator */}
          <a
            href="/property-value-estimator"
            aria-label="Property Value Estimator - Launch tool"
            className="group relative flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">
                Property Value Estimator
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                Get instant property value estimates powered by data-driven models. Analyze property features, compare similar properties, and receive accurate valuations.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 gap-2 transition-all duration-300">
                <span>Launch Tool</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </a>

          {/* Property Market Analysis */}
          <a
            href="/property-market-analysis"
            aria-label="Property Market Analysis - Launch tool"
            className="group relative flex flex-col p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-3">
                Property Market Analysis
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 flex-1">
                Explore comprehensive market trends, pricing patterns, and neighborhood insights. Make informed decisions with interactive charts and data visualizations.
              </p>
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium group-hover:gap-3 gap-2 transition-all duration-300">
                <span>Launch Tool</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto text-center text-sm text-zinc-400 dark:text-zinc-500">
          © 2026 Property Solutions Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
