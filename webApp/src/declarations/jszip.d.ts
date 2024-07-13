declare module 'jszip' {
    export = JSZip;

    class JSZip {
        constructor();
        file(name: string, data: any): void;
        loadAsync(data: any): Promise<any>;
    }
}
