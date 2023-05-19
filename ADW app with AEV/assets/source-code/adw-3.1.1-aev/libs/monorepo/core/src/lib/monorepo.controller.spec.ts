/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MonorepoController } from './monorepo.controller';
import { WorkspaceConfig } from './workspace-config';
import { LoggerLike, ProjectMetadataJson } from './monorepo.interfaces';
import { resolve } from 'path';
import * as fs from 'fs';
const childProcess = require('child_process');

describe('Monorepo Controller', () => {

    let spawnSyncSpy: jest.SpyInstance;
    let requireMock: NodeRequire;
    let monorepoProjectMetadataJson: ProjectMetadataJson;
    let logger: LoggerLike;
    let workspaceDefinition: any;

    beforeEach(() => {
        logger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        };

        workspaceDefinition = {
            projects: {
                pikachu: {
                    root: 'path/to/project',
                    sourceRoot: 'path/to/project/src'
                },
                tutum: {
                    root: 'path/to/project2',
                    sourceRoot: 'path/to/project2/src'
                }
            }
        };

        requireMock = ((path) => {
            if (path === `${process.cwd()}/path/to/project/project.metadata.json`) {
                return monorepoProjectMetadataJson;
            } else {
                throw new Error('File not found, mock it properly...');
            }
        }) as unknown as NodeRequire;

        jest.spyOn(WorkspaceConfig.prototype, 'getProjectNames').mockReturnValue(Object.keys(workspaceDefinition.projects));
        jest.spyOn(WorkspaceConfig.prototype, 'getProject').mockImplementation(projectName => workspaceDefinition.projects[projectName]);
    });

    describe('getMonorepoProjectMetadata', () => {
        beforeEach(() => {
            monorepoProjectMetadataJson = {
                scripts: {
                    postinstall: [
                        { command: 'command1', args: ['arg1'] },
                    ],
                    prestart: [
                        { command: 'command2', args: ['arg1', 'arg2'] },
                        { command: 'command3', args: ['arg3', 'arg4'] },
                    ],
                    prebuild: [
                        { command: '$COMMAND', args: ['$ARG1', '$ARG2'] }
                    ],
                },
            };
        });

        it(`should return the project's monorepo metadata for a project which exists`, () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);

            const monorepoProjectMetadata = MonorepoController.getMonorepoProject('pikachu', logger, requireMock);

            expect(monorepoProjectMetadata.hookExists('postinstall')).toBeTruthy();
            expect(monorepoProjectMetadata.hookExists('prestart')).toBeTruthy();
            expect(monorepoProjectMetadata.hookExists('prestart')).toBeTruthy();
            expect(monorepoProjectMetadata.hookExists('prebuild')).toBeTruthy();
            expect(monorepoProjectMetadata.name).toBe('pikachu');
        });

        it(`should throw error if non existing project is tried to be retrieved`, () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            const nonExistingProject = () => MonorepoController.getMonorepoProject('piccolo');

            expect(nonExistingProject).toThrowError(`Project (piccolo) doesn't exist in workspace file`);
        });

        it(`should throw error if project's monorepo metadata doesn't exist`, () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            const noMonorepoProjectMetadataFilePresent = () => MonorepoController.getMonorepoProject('tutum');
            expect(noMonorepoProjectMetadataFilePresent).toThrowError(`Project monorepo metadata, can't be found: ${process.cwd()}/path/to/project2/project.metadata.json`);
        });
    });

    describe('triggerHookOnProject', () => {

        beforeEach(() => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            spawnSyncSpy = jest.spyOn(childProcess, 'spawnSync');
        });

        afterEach(() => {
            spawnSyncSpy.mockRestore();
        });

        it('should set the right additional environment variables', () => {
            monorepoProjectMetadataJson = {
                scripts: {
                    postinstall: [
                        { command: 'command1', args: ['arg1'] },
                    ]
                }
            };
            const projectName = 'pikachu';
            spawnSyncSpy.mockReturnValue({status: 0});

            MonorepoController.triggerHookOnProject(projectName, 'postinstall', logger, requireMock);

            expect(process.env.THIS_PROJECT).toBe(projectName);
            expect(process.env.THIS_PROJECT_ROOT_PATH).toBe(resolve(process.cwd(), workspaceDefinition.projects.pikachu.root));
            expect(process.env.THIS_PROJECT_SOURCE_ROOT_PATH).toBe(resolve(process.cwd(), workspaceDefinition.projects.pikachu.sourceRoot));
        });

        it('should invoke every command in the hook if present', () => {
            monorepoProjectMetadataJson = {
                scripts: {
                    prestart: [
                        { command: 'command2', args: ['arg1', 'arg2'] },
                        { command: 'command3', args: ['arg3', 'arg4'] },
                    ]
                }
            };
            const projectName = 'pikachu';
            spawnSyncSpy.mockReturnValue({status: 0});

            MonorepoController.triggerHookOnProject(projectName, 'prestart', logger, requireMock);

            expect(logger.info).toHaveBeenCalledWith(`Executing prestart hook for ${projectName}`);
            expect(spawnSyncSpy).toHaveBeenCalledWith(
                monorepoProjectMetadataJson.scripts.prestart[0].command,
                monorepoProjectMetadataJson.scripts.prestart[0].args,
                { cwd: process.cwd(), stdio: 'inherit' }
            );

            expect(spawnSyncSpy).toHaveBeenCalledWith(
                monorepoProjectMetadataJson.scripts.prestart[1].command,
                monorepoProjectMetadataJson.scripts.prestart[1].args,
                { cwd: process.cwd(), stdio: 'inherit' }
            );
        });

        it('should interpolate command and args', () => {
            monorepoProjectMetadataJson = {
                scripts: {
                    prebuild: [
                        { command: '$COMMAND', args: ['$ARG1', '$ARG2'] }
                    ]
                }
            };
            const projectName = 'pikachu';
            spawnSyncSpy.mockReturnValue({status: 0});

            process.env.COMMAND = 'interpolated-command';
            process.env.ARG1 = 'interpolated-arg1';
            process.env.ARG2 = 'interpolated-arg2';
            MonorepoController.triggerHookOnProject(projectName, 'prebuild', logger, requireMock);

            expect(spawnSyncSpy).toHaveBeenCalledWith(
                process.env.COMMAND,
                [process.env.ARG1, process.env.ARG2],
                { cwd: process.cwd(), stdio: 'inherit' }
            );
        });

        it('should log and pass through the error of the command, if it happens', () => {
            monorepoProjectMetadataJson = {
                scripts: {
                    prebuild: [
                        { command: '$COMMAND', args: ['$ARG1', '$ARG2'] }
                    ]
                }
            };
            const projectName = 'pikachu';

            const thrownError = new Error('Error thrown from command');
            spawnSyncSpy.mockReturnValue({error: thrownError});

            const trigger = () => MonorepoController.triggerHookOnProject(projectName, 'prebuild', logger, requireMock);

            expect(trigger).toThrow(thrownError);
        });

        it('should not throw an error if the hook is not present', () => {
            monorepoProjectMetadataJson = {
                scripts: {}
            };
            const projectName = 'pikachu';

            const trigger = () => MonorepoController.triggerHookOnProject(projectName, 'notExistingHook', logger, requireMock);

            expect(trigger).not.toThrow();
            expect(logger.debug).toHaveBeenCalledWith(`Hook: notExistingHook is not defined for project: ${projectName}`);
        });

        it('should throw an error if any of the hook exits with any status code but 0', () => {
            monorepoProjectMetadataJson = {
                scripts: {
                    prebuild: [
                        { command: '$COMMAND', args: ['$ARG1', '$ARG2'] }
                    ]
                }
            };
            const projectName = 'pikachu';
            spawnSyncSpy.mockReturnValue({status: 8});

            const trigger = () => MonorepoController.triggerHookOnProject(projectName, 'prebuild', logger, requireMock);

            expect(trigger).toThrow(`Command exited with code 8`);
        });
    });

});
