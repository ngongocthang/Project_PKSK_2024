import react from '@vitejs/plugin-react';
import path from "path"; // Thêm dòng này
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  
    },
  },
});
