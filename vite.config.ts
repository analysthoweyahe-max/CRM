import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
		dedupe: ["react", "react-dom"],
	},
	server: {
		port: 3000,
		proxy: {
			"/api": {
				target: "https://crm-hr.subcodeco.com",
				changeOrigin: true,
				secure: true
				// rewrite: (path) => `/index.php${path}`,
			},
		},
		watch: {
			ignored: ["**/dist/**", "**/dist.zip"],
		},
	},
});
