import {execFileSync} from 'node:child_process'
import { defineConfig, type Plugin } from 'vite'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import mosqueHandler from './api/mosques'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const buildId=()=>{if(process.env.VERCEL_GIT_COMMIT_SHA)return process.env.VERCEL_GIT_COMMIT_SHA.slice(0,8);try{return execFileSync('git',['rev-parse','--short=8','HEAD'],{stdio:['ignore','pipe','ignore']}).toString().trim();}catch{return 'web-'+Date.now().toString(36);}};
const release={id:buildId(),builtAt:new Date().toISOString()};
export default defineConfig({
  define:{__QC_RELEASE__:JSON.stringify(release)},
  server: { proxy: { '/book-audio/catalog': {target:'https://quran-coach-audio.madouyatt95.workers.dev',changeOrigin:true,rewrite:path=>path.replace('/book-audio',''),configure:proxy=>{proxy.on('proxyReq',request=>request.removeHeader('origin'));}}, '/verse-audio/': { target:'https://cdn.islamic.network',changeOrigin:true,rewrite:path=>path.replace('/verse-audio/','/quran/audio/') }, '/offline-audio/': { target: 'https://cdn.islamic.network', changeOrigin: true, rewrite: path => path.replace('/offline-audio/', '/quran/audio/128/ar.alafasy/') } } },
  worker: { format: 'es' },
  plugins: [
    {name:'release-info',generateBundle(){this.emitFile({type:'asset',fileName:'version.json',source:JSON.stringify(release)});}},
    react(),
    {
      name: 'local-mosque-api',
      configureServer(server) {
        server.middlewares.use('/api/mosques', async (req, res) => {
          const query=Object.fromEntries(new URL(req.url || '/', 'http://localhost').searchParams);
          const response=res as unknown as VercelResponse;
          response.status=(code:number)=>{res.statusCode=code;return response;};
          response.json=(value:unknown)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return response;};
          await mosqueHandler(Object.assign(req,{query}) as VercelRequest,response);
        });
      },
    } satisfies Plugin,
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: 'auto',
      manifest: {
        name: 'Quran Coach',
        short_name: 'QuranCoach',
        description: 'Application de lecture et mémorisation du Coran',
        theme_color: '#0D1117',
        background_color: '#0D1117',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,mp3,wav}'],
        globIgnores: ['version.json','tilawa/**','audio/narration/**/*.mp3','audio/invocations/**/*.mp3'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // Augmenter la limite à 15 Mo pour permettre le cache des gros JSON (comme le Tafsir ou le Coran complet)
      },
      devOptions: {
        enabled: false,
      },
    })
  ]
})
