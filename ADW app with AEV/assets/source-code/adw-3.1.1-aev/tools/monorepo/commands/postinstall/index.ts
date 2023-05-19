/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { yellow } from 'chalk';
import { execSync } from 'child_process';
import { Command, CommandLogger, ConfirmParam, Runnable } from '../../../shared/command';

@Command({
    name: __filename,
    description: `Postinstall script for monorepository`
})
export default class PostInstallCommand implements Runnable {

    @ConfirmParam({ required: false, alias: 'm', title: 'Build monorepo-builders?' })
    monorepoBuilders = false;

    @ConfirmParam({ required: false, alias: 'a', title: 'Decorate Angular CLI with nx?' })
    cliDecor = false;

    @ConfirmParam({ required: false, alias: 'n', title: 'Invoke ngcc compilation?' })
    ngcc = false;

    @ConfirmParam({ required: false, alias: 'H', title: 'Invoke postinstall hooks?' })
    hooks = false;

    @ConfirmParam({ required: false, alias: 'w', title: 'Webdriver-manager update?' })
    webdriverUpdate = false;

    CI = false;

    async run(logger: CommandLogger) {
        this.CI = !!process.env.CI;

        if (this.cliDecor) { this.decorateAngularCLI(logger); }
        if (this.monorepoBuilders) { this.buildMonorepoBuilders(logger); }
        if (this.ngcc) { this.executeNgcc(logger); }
        if (this.monorepoBuilders && this.hooks) {
            await this.performProjectInstall(logger);
        }
        if (this.webdriverUpdate) { this.performWebdriverManagerUpdate(logger); }
        this.installHuskyInLocalEnvironment(logger);
        this.checkPathDirectories(logger);
    }

    private buildMonorepoBuilders(logger: CommandLogger) {
        logger.info('Building monorepo builders');
        execSync('$(npm bin)/nx test monorepo-builders --skip-nx-cache', { stdio: 'inherit' });
        execSync('$(npm bin)/nx build monorepo-builders --skip-nx-cache', { stdio: 'inherit' });
    }

    private decorateAngularCLI(logger: CommandLogger) {
        logger.info('Decorating Angular CLI');
        execSync('node ./decorate-angular-cli.js', { stdio: 'inherit' });
    }

    private executeNgcc(logger: CommandLogger) {
        logger.info('Running ngcc');
        execSync('$(npm bin)/ngcc --properties es2015 browser module main', { stdio: 'inherit' });
    }

    private performWebdriverManagerUpdate(logger: CommandLogger) {
        logger.info('Update webdriver-manager');
        let chromeVersion = '';
        if (this.CI) {
            chromeVersion = '--versions.chrome=$(google-chrome --product-version)';
        }

        execSync(`$(npm bin)/webdriver-manager update --gecko=false ${chromeVersion}`, { stdio: 'inherit' });
    }

    private async performProjectInstall(logger: CommandLogger) {
        const buildMonorepoBuildersPackage = '@alfresco-dbp/monorepo/core';
        const { MonorepoController } = await import(buildMonorepoBuildersPackage);

        logger.info('Running postinstall scripts for all of the projects, which has it');
        MonorepoController.triggerHookOnEveryProject('postinstall', logger);
    }

    private checkPathDirectories(logger: CommandLogger) {
        if (!this.CI) {
            logger.info('Checking directories of the PATH');
            const CI_SCRIPTS_DIR = `${process.cwd()}/scripts/ci`;
            let PATH_EXTENSION = `${CI_SCRIPTS_DIR}/job_hooks:${CI_SCRIPTS_DIR}/jobs:${CI_SCRIPTS_DIR}/utils`;
            if (!process.env.PATH.includes(PATH_EXTENSION)) {
                PATH_EXTENSION = `export PATH="$PATH:${PATH_EXTENSION}"`;
                // eslint-disable-next-line max-len
                logger.info(yellow('Monorepo Warning: Some directories are not present in your PATH environment variable. This is necessary, if you want to have the same settings as what the CI has.'));
                logger.info(yellow(`Please add the following to your .bash_profile or .profile or whichever personal ` +
                `initialization file you use for configuring your environment.`));
                logger.info(yellow('*'.repeat(169)));
                logger.info(PATH_EXTENSION);
                logger.info(yellow('*'.repeat(169)));
            }
        }
    }

    private installHuskyInLocalEnvironment(logger: CommandLogger) {
        if (!this.CI) {
            execSync('$(npm bin)/husky install', { stdio: 'inherit' });
            logger.info('Installed husky for local development');
        }
    }
}
