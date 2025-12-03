type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

function createLogger(level: LogLevel) {
  return (...args: unknown[]) => {
    if (!isDev && level === 'debug') return;
    console[level === 'debug' ? 'log' : level](...args);
  };
}

export const logger = {
  debug: createLogger('debug'),
  info: createLogger('info'),
  warn: createLogger('warn'),
  error: createLogger('error'),
};
