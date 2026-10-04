import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const dir = path.resolve("public/tilawa/v1");
await mkdir(dir, { recursive: true });
const assets = [
  [
    "model.onnx",
    "https://github.com/yazinsai/tilawa/releases/download/zipformer-a0w-ep1-a0.5/zipformer_a0w_ep1_a05.int8.onnx",
    "bfb5b712695634a6099b45a6a78003bd5103417c4eae6338277d54679254905a",
  ],
  [
    "corpus.json",
    "https://github.com/yazinsai/tilawa/releases/download/v0.3.0/zipformer_quran.json",
    "24360c05ec88fcacf3419c1fe6cd81d69e653326a0bf0e4fb507e7b98fc88127",
  ],
  [
    "NPL-1.2.txt",
    "https://github.com/yazinsai/tilawa/releases/download/zipformer-a0w-ep1-a0.5/NPL-1.2.txt",
    "77526bdbfac94132e5114c3a34492c33f915e4b7f310f00b9995500d3610cab5",
  ],
];
const sha = (data) => createHash("sha256").update(data).digest("hex");
for (const [name, url, digest] of assets) {
  let bytes;
  try {
    bytes = await readFile(path.join(dir, name));
  } catch {
    /* first build */
  }
  if (!bytes || sha(bytes) !== digest) {
    console.log(`Downloading Tilawa ${name}…`);
    const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (sha(bytes) !== digest) throw new Error(`${name}: integrity mismatch`);
    await writeFile(path.join(dir, name), bytes);
  }
}
for (const name of [
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
])
  await copyFile(
    `node_modules/onnxruntime-web/dist/${name}`,
    path.join(dir, name),
  );
await copyFile(
  "node_modules/@tilawa/core/LICENSE",
  path.join(dir, "Tilawa-MIT.txt"),
);
await copyFile(
  "node_modules/@tilawa/core/NOTICE.md",
  path.join(dir, "NOTICE.md"),
);
await copyFile(
  "scripts/licenses/ONNX-LICENSE.txt",
  path.join(dir, "ONNX-LICENSE.txt"),
);
await copyFile(
  "public/tilawa/capture-worklet.js",
  path.join(dir, "capture-worklet.js"),
);
const names = [
  ...assets.map((a) => a[0]),
  "ort-wasm-simd-threaded.mjs",
  "ort-wasm-simd-threaded.wasm",
  "Tilawa-MIT.txt",
  "NOTICE.md",
  "ONNX-LICENSE.txt",
  "capture-worklet.js",
];
const files = await Promise.all(
  names.map(async (name) => {
    const b = await readFile(path.join(dir, name));
    return { url: `/tilawa/v1/${name}`, bytes: b.length, sha256: sha(b) };
  }),
);
await writeFile(
  path.join(dir, "manifest.json"),
  JSON.stringify(
    { version: "zipformer-a0w-ep1-a0.5-ort1.24.2", files },
    null,
    2,
  ),
);
console.log(
  "Tilawa assets verified:",
  Math.round(files.reduce((n, f) => n + f.bytes, 0) / 1024 / 1024),
  "MiB",
);
