import { Languages } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 dark:text-slate-500 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold text-white">Intlize</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 dark:border-slate-900 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Intlize Library. Built with ❤️ for the
            developer community.
          </p>
        </div>
      </div>
    </footer>
  );
}
