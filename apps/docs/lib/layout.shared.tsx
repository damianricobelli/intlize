import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Languages } from "lucide-react";

export function baseOptions(): BaseLayoutProps {
  return {
    githubUrl: "https://github.com/damianricobelli/intlize",
    nav: {
      title: (
        <div className="flex items-center gap-2 text-lg">
          <Languages fill="currentColor" />
          <span className="hidden md:block">Intlize</span>
        </div>
      ),
      transparentMode: "top",
    },
    links: [],
  };
}
