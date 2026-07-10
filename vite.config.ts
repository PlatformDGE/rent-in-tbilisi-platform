import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/rent-in-tbilisi-platform/',
  plugins: [react()],
});
