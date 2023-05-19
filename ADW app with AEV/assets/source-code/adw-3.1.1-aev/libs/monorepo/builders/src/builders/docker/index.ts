/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createBuilder, BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { json } from '@angular-devkit/core';
import { DockerDeploySchema } from './schema';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MonorepoController, HookExecutionEnvironment, MONOREPO_PROJECT_METADATA_FILE } from '@alfresco-dbp/monorepo/core';
import { spawnSync } from 'child_process';
import { resolve } from 'path';

enum ACTIONS {
    Publish = 'publish',
    Link = 'link'
}

export function commandBuilder(options: DockerDeploySchema, context: BuilderContext): Observable<any> | Observable<BuilderOutput> {
    return from(context.getProjectMetadata(context.target)).pipe(
        map(() => {
            const QUAY_USERNAME = process.env['QUAY_USERNAME'];
            const QUAY_PASSWORD = process.env['QUAY_PASSWORD'];

            if (QUAY_USERNAME === undefined || QUAY_PASSWORD === undefined) {
                throw new Error(`Missing env variables: The docker username and deploy password are mandatory. Please check your env variables QUAY_USERNAME|QUAY_PASSWORD `);
            }

            const DOCKER_REPOSITORY_DOMAIN = options.repositoryDomain;
            const REPO_SLUG = options.repositorySlug;
            const SOURCE_TAG = options.sourceTag;
            const DOCKER_REPOSITORY = `${DOCKER_REPOSITORY_DOMAIN}/${REPO_SLUG}`;
            const dockerProjectArgs = ['--buildArgs', `PROJECT_NAME=${options.outputPath}`];

            options?.envVars?.forEach((envVar) => {
                dockerProjectArgs.push('--buildArgs');
                dockerProjectArgs.push(`${envVar.name}=${envVar.value}`);
            });

            const tagInterpolation = HookExecutionEnvironment.interpolateEnvVars(options.tag);

            context.logger.debug('DOCKER_REPOSITORY_DOMAIN: ' + DOCKER_REPOSITORY_DOMAIN);
            context.logger.debug('REPO_SLUG: ' + REPO_SLUG);
            context.logger.debug('ACTION: ' + options.action);
            context.logger.debug('FILE: ' + options.file);

            const monorepoMetadata = MonorepoController.getMonorepoProject(context.target.project, context.logger);

            if (!monorepoMetadata.isDeployable()) {
                throw new Error(`;
                Missing;
                metatada: the;
                deploy;
                section;
                is;
                mandatory.Check;
                the; ${MONOREPO_PROJECT_METADATA_FILE}
                on ${context.target.project}`);
            }

            let dockerCmdRes;
            if (options.action === ACTIONS.Publish) {
                const tagsWithSuffix = tagInterpolation.split(',').map(value => `${value}${monorepoMetadata.tagVersionSuffix}`);
                context.logger.debug('TAG suffix: ' + `${tagsWithSuffix}`);

                const filenameOption = [];
                if (options.file) {
                    filenameOption.push('--fileName');
                    filenameOption.push(options.file);
                }

                dockerCmdRes = spawnSync('$(npm bin)/adf-cli', [
                    'docker',
                    '--target', ACTIONS.Publish,
                    '--loginCheck',
                    '--loginUsername', QUAY_USERNAME,
                    '--loginPassword', QUAY_PASSWORD,
                    '--loginRepo', DOCKER_REPOSITORY_DOMAIN,
                    '--dockerRepo', DOCKER_REPOSITORY,
                    '--dockerTags', `${tagsWithSuffix}`,
                    ...filenameOption,
                    ...dockerProjectArgs
                ], { cwd: resolve('./'), shell: true});
            } else {
                dockerCmdRes = spawnSync('$(npm bin)/adf-cli', [
                    'docker',
                    '--target', ACTIONS.Link,
                    '--loginCheck',
                    '--loginUsername', QUAY_USERNAME,
                    '--loginPassword', QUAY_PASSWORD,
                    '--loginRepo', DOCKER_REPOSITORY_DOMAIN,
                    '--dockerRepo', DOCKER_REPOSITORY,
                    '--dockerTags', `${[monorepoMetadata.releaseVersion, ...monorepoMetadata.tagAliases]}`,
                    ...dockerProjectArgs,
                    '--sourceTag', `${SOURCE_TAG}${monorepoMetadata.tagVersionSuffix}`
                ], { cwd: resolve('./'), shell: true});
            }

            if (dockerCmdRes.status === 0 ) {
                context.logger.info(dockerCmdRes.stdout.toString());
                return { success: true };
            } else {
                throw new Error(dockerCmdRes.stderr.toString());
            }
        }
        ));
}

export default createBuilder<json.JsonObject & DockerDeploySchema>(commandBuilder) as any; // Since we are using an internal contract...
