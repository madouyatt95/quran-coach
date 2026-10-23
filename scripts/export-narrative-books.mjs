import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Local manuscript exports only: no network, provider access or audio generation.
const result = await build({
  stdin: {
    contents: "export { narrativeBooks } from './src/data/narrativeBooks'; export { bookMarkdown, bookNarrative, narrationLength, chapterDrafts } from './src/lib/narrativeBooks';",
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { narrativeBooks, bookMarkdown, bookNarrative, narrationLength, chapterDrafts } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const directory = resolve('docs/audio-books');
await mkdir(directory, { recursive: true });
for (const book of narrativeBooks) {
  await writeFile(resolve(directory, `${book.id}.md`), bookMarkdown(book));
  for (const chapter of book.chapters) await writeFile(resolve(directory, `${book.id}-${chapter.id}.md`), bookMarkdown(book, chapter));
  const duration = narrationLength(bookNarrative(book));
  console.log(JSON.stringify({ book: book.title, version: book.version, words: duration.words, estimatedMinutes: [duration.minMinutes, duration.maxMinutes], chapters: book.chapters.map(chapter => ({ title: chapter.title, parts: chapterDrafts(book, chapter).map(draft => draft.text.length) })) }));
}
