import log4js, {Level} from "log4js";
const logger = log4js.getLogger("app");
logger.level = process.env.LOG_LEVEL as string | Level || 'info';

export default logger;