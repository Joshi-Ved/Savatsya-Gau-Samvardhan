/**
 * Structured Logger Utility
 * 
 * A lightweight structured logger that wraps console methods with
 * consistent formatting. Can be replaced with `pino` or `winston`
 * for production by changing only this file.
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] ?? LOG_LEVELS.info;

function formatMessage(level, context, message, meta) {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${metaStr}`;
}

const logger = {
  debug(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.debug(formatMessage('debug', context, message, meta));
    }
  },

  info(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(formatMessage('info', context, message, meta));
    }
  },

  warn(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', context, message, meta));
    }
  },

  error(context, message, meta) {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', context, message, meta));
    }
  },
};

export default logger;
