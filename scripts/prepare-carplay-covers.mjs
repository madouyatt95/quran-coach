import {createRequire} from 'node:module';
import {join} from 'node:path';
import {mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

export function prepareCarPlayCovers() {
  // Compile the actual library jacket component with the project's React runtime.
  const temp = mkdtempSync(join('node_modules', '.qc-jackets-'));
  try {
    const component = readFileSync('src/components/Books/BookCoverArt.tsx', 'utf8');
    const compiled = ts.transpileModule(component, {compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
    }});
    const require = createRequire(import.meta.url);
    const modulePath = join(process.cwd(), temp, 'jacket.cjs');
    writeFileSync(modulePath, compiled.outputText);
    const {BookCoverArt} = require(modulePath);
    const books = JSON.parse(readFileSync('src/data/bookCatalog.json', 'utf8'));
    const dest = 'ios/App/App/public/car-art';
    mkdirSync(dest, {recursive:true});
    function png(filename, svg) {
      const rendered = new Resvg(svg, {font: {
        loadSystemFonts: false,
        fontFiles: svg.includes('<text') ? ['/System/Library/Fonts/Supplemental/Arial Bold.ttf'] : [],
        defaultFontFamily: 'Arial',
      }}).render();
      writeFileSync(join(dest, filename), rendered.asPng());
    }
    for (const {id} of books) {
      if (!/^[a-z0-9-]+$/.test(id)) throw Error('Identifiant de couverture invalide');
      const markup = renderToStaticMarkup(createElement(BookCoverArt, {bookId:id}));
      const svg = markup.match(/<svg[\s\S]*?<\/svg>/)?.[0];
      if (!svg) throw Error('Pochette absente : ' + id);
      png('book-' + id + '.png', svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" ').replace('0 0 600 900','0 0 600 600'));
    }
    for (let n = 1; n <= 114; n++) {
      const number = '<text x="100" y="116" fill="#fff1c3" text-anchor="middle" font-family="Arial,sans-serif" font-size="52" font-weight="bold">' + n + '</text>';
      const ring = '<circle cx="100" cy="100" r="84" fill="#302144" stroke="#e5c584" stroke-width="5"/>';
      const svg = (size, contents) => '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 200 200">'+contents+'</svg>';
      png('badge-' + n + '.png', svg(96, ring + number));
      const ornament = '<defs><radialGradient id="light"><stop stop-color="#493256"/><stop offset="1" stop-color="#211a36"/></radialGradient></defs><rect width="200" height="200" fill="url(#light)"/><g fill="none" stroke="#b69964" stroke-width=".8"><rect x="8" y="8" width="184" height="184" rx="3"/><path d="M14 38V14H38M162 14H186V38M14 162V186H38M162 186H186V162"/><path d="M100 25l18 5 13 14 18 7 7 18 14 13 5 18-5 18-14 13-7 18-18 7-13 14-18 5-18-5-13-14-18-7-7-18-14-13-5-18 5-18 14-13 7-18 18-7 13-14z"/></g>';
      png('surah-' + n + '.png', svg(480, ornament + '<g transform="translate(37 37) scale(.63)">' + ring + number + '</g>'));
    }
  } finally { rmSync(temp,{recursive:true,force:true}); }
}
