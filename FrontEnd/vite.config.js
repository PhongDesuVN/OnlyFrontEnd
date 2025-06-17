import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8083", // ← Sửa từ 8080 thành 8083
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
