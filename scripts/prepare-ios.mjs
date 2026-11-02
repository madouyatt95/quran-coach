import {spawnSync} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';

import {prepareCarPlayCovers} from './prepare-carplay-covers.mjs';

// A CarPlay scene may start before the web scene: ship its authoritative indices.
mkdirSync('public/carplay',{recursive:true});
for(const [name,source] of [['surahs','src/lib/interactiveMushaf/chapters.json'],['books','src/data/bookCatalog.json'],['listening','src/data/carListeningCatalog.json']]) {
  const data=JSON.parse(readFileSync(source,'utf8'));
  writeFileSync(`public/carplay/${name}.json`,JSON.stringify(data));
}

// Native releases must include the public features enabled in production.
// These are public endpoints/flags, never server credentials.
const env = {
  ...process.env,
  VITE_AUDIO_PRODUCTION_URL: 'https://quran-coach-audio.madouyatt95.workers.dev',
  VITE_PROGRESS_SYNC_ENABLED: 'true',
};
for (const [command, args] of [['npm', ['run', 'build']], ['npx', ['cap', 'sync', 'ios']]]) {
  const result = spawnSync(command, args, {env, stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

prepareCarPlayCovers();
