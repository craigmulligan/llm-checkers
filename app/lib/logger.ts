import logger, { LogLevelDesc } from "loglevel";

if (process.env.LOG_LEVEL != null)
  logger.setLevel(process.env.LOG_LEVEL as LogLevelDesc);

export default logger;
