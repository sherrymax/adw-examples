/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createLogger, transports, format, Logger } from 'winston';
import { yellow, green, red, blue, magenta, cyan } from 'chalk';
import { CustomLogger } from './logger.interface';

const levels = {
    error: red,
    warn: yellow,
    info: cyan,
    verbose: magenta,
    debug: green,
    silly: blue
};

const myFormat = format.printf(({ level, message }) => levels[level](message));

const loggerInstance: any = createLogger({
    transports: [new transports.Console()],
    format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
        myFormat
    ),
});

loggerInstance.getLevels = () => Object.keys(levels);

export const logger: Logger & CustomLogger = loggerInstance;
