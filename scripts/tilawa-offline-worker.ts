// Browser smoke-test wrapper: all inference HTTP requests are forbidden after imports.
import '../src/lib/tilawa/engine.worker';
const originalFetch = self.fetch.bind(self);
self.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith('blob:')) throw new Error('Unexpected inference network request: ' + url);
    return originalFetch(input, init);
};
