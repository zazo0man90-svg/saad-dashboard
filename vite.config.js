import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({base:'./',plugins:[react(),{name:'source-entry',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url==='/'||req.url?.startsWith('/?'))req.url='/app.html';next();});}}],build:{outDir:'dist',rollupOptions:{input:'app.html'}},server:{port:5173}});
