declare module 'pako' {
    interface InflateOptions {
      to: 'string';
    }
  
    function inflate(data: ArrayBuffer, options?: InflateOptions): string;
  }
  