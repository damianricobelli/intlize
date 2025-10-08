import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: false,
	clean: true,
	minify: "terser",
	treeshake: true,
	splitting: true,
	external: ["react"],
	tsconfig: "tsconfig.json",
	terserOptions: {
		compress: {
			drop_console: true,
			pure_funcs: ["console.info", "console.debug"],
		},
		mangle: true,
	},
});
