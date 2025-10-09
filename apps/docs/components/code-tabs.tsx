"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const TABS = [
  {
    id: "react",
    label: "locales/en.ts",
    language: "tsx",
    code: `const en = {
  "hello.world": "Hello {name}!",
  "plural#zero": "Nothing to see here",
  "plural#one": "A single item",
  "plural#two": "A pair of items",
  "plural#few": "A few items: {count}",
  "plural#many": "Many items: {count}",
  "plural#other": "A lot of items: {count}",
  "scoped.translations": "Nested translations",
} as const

// Use this type to satisfy your other languages
export type BaseLocale = Record<keyof typeof en, string>

export default en`,
  },
  {
    id: "config",
    label: "locales/i18n.config.ts",
    language: "typescript",
    code: `import { createI18n } from "@intlize/react-router";

export const { i18nClient, i18nServer, getLocalePath, getDir } = createI18n(
  {
    en: () => import("./en"),
    es: () => import("./es"),
  },
  {
    defaultLocale: "en",
    fallbackLocale: "en",
    regions: {
      en: ["US"],
      es: ["ES"],
    },
    prefixDefaultLocale: true,
  },
)
`,
  },
  {
    id: "home",
    label: "routes/home.tsx",
    language: "typescript",
    code: `import { use } from "react";

import { i18nClient } from "@/locales/i18n.config";

export default function Home() {
  const t = use(i18nClient.t());
  const scopedT = use(i18nClient.scopedT("scoped"));
  return (
    <div>
      <h1>{t('hello.world', { name: 'John' })}</h1>
      <p>{t('plural#one', { count: 1 })}</p>
      <p>{scopedT('translations')}</p>
    </div>
  )
}
`,
  },
];

export const CodeTabs = () => {
  const [activeTab, setActiveTab] = useState("react");
  const { language, code } = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-slate-700 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 dark:bg-slate-900 border-b border-slate-700 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex gap-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-1.5 text-xs font-mono rounded-t transition-colors ${
                  activeTab === id
                    ? "bg-slate-900 dark:bg-slate-950 text-slate-200"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          background: "transparent",
          fontSize: "0.875rem",
        }}
        showLineNumbers={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
