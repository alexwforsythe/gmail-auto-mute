enum Level {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Log {
  private static log(level: Level, message: string, fields?: object) {
    // eslint-disable-next-line no-restricted-globals
    Logger.log({ level, message, ...fields });
  }

  static debug(msg: string, fields?: object) {
    this.log(Level.DEBUG, msg, fields);
  }

  static info(msg: string, fields?: object) {
    this.log(Level.INFO, msg, fields);
  }

  static warn(msg: string, fields?: object) {
    this.log(Level.WARN, msg, fields);
  }

  static error(msg: string, fields?: object) {
    this.log(Level.ERROR, msg, fields);
  }
}

export default Log;
