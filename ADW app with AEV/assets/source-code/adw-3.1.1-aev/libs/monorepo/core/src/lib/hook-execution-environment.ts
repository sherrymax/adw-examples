/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { LoggerLike } from './monorepo.interfaces';
import { spawnSync } from 'child_process';
import { resolve } from 'path';

export class HookExecutionEnvironment {
    public static interpolateEnvVars(str: string) {
        return str?.replace(/(\$[a-zA-Z0-9_]*)/g, (_, variableName) => process.env[variableName.replace(/^\$/, '')]);
    }

    static setVariables(variables: { [varName: string]: string }) {
        Object.keys(variables).forEach((variableName) => {
            process.env[variableName] = variables[variableName];
        });
    }

    constructor(private logger?: LoggerLike) {}

    invokeCommand(command: string, args: string[]) {
        const interpolatedArgs = args.map(HookExecutionEnvironment.interpolateEnvVars);
        const interpolatedCommand = HookExecutionEnvironment.interpolateEnvVars(command);

        this.logger?.info(`Running command: ${interpolatedCommand}`);
        this.logger?.debug(`With arguments: ${JSON.stringify(interpolatedArgs, null, 2)}`);
        const childProcess = spawnSync(interpolatedCommand, interpolatedArgs, { cwd: resolve('./'), stdio: 'inherit' });

        if (childProcess.error) {
            this.logger?.error(`Command failed ${command}`);
            this.logger?.error(`Interpolated command: ${interpolatedCommand}`);
            this.logger?.error(`Interpolated arguments: ${JSON.stringify(interpolatedArgs, null, 2)}`);
            throw childProcess.error;
        }

        if (childProcess.status !== 0) {
            this.logger?.error(`Interpolated command: ${interpolatedCommand}`);
            this.logger?.error(`Interpolated arguments: ${JSON.stringify(interpolatedArgs, null, 2)}`);
            throw new Error(`Command exited with code ${childProcess.status}`);
        }
    }
}
