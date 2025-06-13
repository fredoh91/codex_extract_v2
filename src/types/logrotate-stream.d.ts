declare module 'logrotate-stream' {
  interface LogrotateStreamOptions {
    file: string;
    size: string;
    keep: number;
    compress?: boolean;
  }

  function logrotateStream(options: LogrotateStreamOptions): NodeJS.WritableStream;
  export = logrotateStream;
} 