declare module 'harfbuzzjs' {
    const harfbuzzjs: Promise<any>;
    export default harfbuzzjs;
}

declare module 'harfbuzzjs/hbjs.js' {
    const hbjs: (instance: WebAssembly.Instance) => any;
    export default hbjs;
}
