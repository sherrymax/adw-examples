/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { resolve } from 'path';
import { Options } from './language-check.interfaces';
import { BuilderContext } from '@angular-devkit/architect';
import { WorkspaceConfig } from '@alfresco-dbp/monorepo/core';

const fs = require('fs');
const fsPromises = fs.promises;
const fsPath = require('path');
const chalk = require('chalk');
interface Occurrence {
    file: string;
    key: string;
    occurrences?: number;
}
const TRANSLATION_KEY_REGEX = /(?<={{\s*['"])([^"']*)(?!.*\+)(?=.*\|\s*translate)\w+/g;
const TRANSLATION_FILE = '/en.json';
let logger: any;

async function readFileIfExists (path: string): Promise<string> {
    let data: string;
    if (fs.existsSync(path)) {
        data = await fsPromises.readFile(path, 'utf-8');
    } else {
        logger.warn('Translation key not found:', path);
        data = JSON.stringify({});
    }
    return data;
}

function getFlattenObject(currentNode: any, target: any, flattenedKey?: string): any {
    for (const key in currentNode) {
        // eslint-disable-next-line no-prototype-builtins
        if (currentNode.hasOwnProperty(key)) {
            let newKey = '';
            if (flattenedKey === undefined) {
                newKey = key;
            } else {
                newKey = flattenedKey + '.' + key;
            }

            const value = currentNode[key];
            if (typeof value === 'object') {
                getFlattenObject(value, target, newKey);
            } else {
                target[newKey] = value;
            }
        }
    }
}

async function iteratePath(path: string, accumulator: string[], validation: (param: string) => boolean) {
    const stat = fs.lstatSync(path);
    if (stat.isDirectory()) {
        const files: any = await fsPromises.readdir(path);
        for (const file of files) {
            await iteratePath(`${path}/${file}`, accumulator, validation);
        }
    } else if (stat.isFile() && validation(path)) {
        accumulator.push(path);
    }
}

function sourceFileValidation(path: string) {
    return path.indexOf(TRANSLATION_FILE) <= 0 && (fsPath.extname(path) === '.ts' || fsPath.extname(path) === '.html' || fsPath.extname(path) === '.json');
}

function translationFileValidation(path: string) {
    return path.indexOf(TRANSLATION_FILE) > 0;
}

async function checkKeysInFile(keys: string[], file: string, result: Occurrence[]) {

    const fileContent = <string> await readFileIfExists(file);
    keys.forEach( (key: string) => {
        const occurrenceCount = countOccurrences(fileContent, key);
        if (occurrenceCount > 0) {
            result.push({
                file: file,
                key: key,
                occurrences: occurrenceCount
            });
        }
    });
}

function countOccurrences(string: string, subString: string): number {
    string += '';
    subString += '';
    if (subString.length <= 0) {
        return (string.length + 1);
    }

    let count = 0, position = 0;
    const step = subString.length;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        position = string.indexOf(subString, position);
        if (position >= 0) {
            ++count;
            position += step;
        } else { break; }
    }
    return count;
}

async function checkUndefinedKeysInFile(translationKeys: string[], file: string, occurrences: any[]): Promise<void> {
    const fileContent = <string> await readFileIfExists(file);
    const fileTranslationKeys = fileContent.match(TRANSLATION_KEY_REGEX);
    if (fileTranslationKeys) {
        fileTranslationKeys.forEach( (key: string) => {
            if (!translationKeys.find( element => element === key)) {
                occurrences.push({
                    file: file,
                    key: key
                });
            }
        });
    }
}

async function searchForTranslationFiles(include: string[], accumulatorFiles: string[]): Promise<void> {
    const iterationPaths = include.map(item => resolve(process.cwd(), item));
    for (const folderPath of iterationPaths) {
        await iteratePath(folderPath, accumulatorFiles, translationFileValidation);
    }
}

async function searchForSourceFiles(include: string[], accumulatorFiles: string[]): Promise<void> {
    const iterationPaths = include.map(item => resolve(process.cwd(), item));
    for (const folderPath of iterationPaths) {
        await iteratePath(folderPath, accumulatorFiles, sourceFileValidation);
    }
}

async function getSharedProjectsPath(include: string[]): Promise<string[]> {
    let projectsRootPath = [];
    const workspaceConfig = new WorkspaceConfig();

    if (include.length > 0) {
        projectsRootPath = include.map( projectName => workspaceConfig.getProject(projectName)?.root);
    }
    return projectsRootPath;
}

async function getAvailableTranslationKeys(translationFiles: string[]): Promise<string[]> {
    const accumulator = [];
    for (const file of translationFiles) {
        const fileContent = <string> await readFileIfExists(file);
        getFlattenObject(JSON.parse(fileContent), accumulator);
    }

    return Object.keys(accumulator);
}

function extractUnusedKeysFromOccurrences(translationKeys: string[], occurrences: Occurrence[]) {
    const result = [];
    translationKeys.forEach((key: string) => {
        if (!occurrences.find( occurrence => occurrence.key === key)) {
            result.push(key);
        }
    });
    return result;
}

async function getUndefinedOccurrences(projectRootPath: string, sharedPaths: string[]): Promise<Occurrence[]> {
    const undefinedOccurrences = [];
    const sourceFiles = [];
    const translationFiles = [];
    const foldersToCheck = [...sharedPaths, projectRootPath];
    await searchForSourceFiles([projectRootPath], sourceFiles);
    await searchForTranslationFiles(foldersToCheck, translationFiles);
    const translationKeys = await getAvailableTranslationKeys(translationFiles);

    for (const file of sourceFiles) {
        await checkUndefinedKeysInFile(translationKeys, file, undefinedOccurrences);
    }

    return undefinedOccurrences;
}

async function getUnusedOccurrences(projectRootPath: string, sharedPaths: string[]): Promise<string[]> {
    const translationFiles = [];
    const sourceFiles = [];
    const occurrences = [];
    const foldersToCheck = [...sharedPaths, projectRootPath];
    await searchForTranslationFiles([projectRootPath], translationFiles);
    await searchForSourceFiles(foldersToCheck, sourceFiles);
    const translationKeys = await getAvailableTranslationKeys(translationFiles);

    for (const file of sourceFiles) {
        await checkKeysInFile(translationKeys, file, occurrences);
    }

    return extractUnusedKeysFromOccurrences(translationKeys, occurrences);
}

export async function startLanguageCheck(projectRootPath: string, options: Options, context: BuilderContext): Promise<boolean> {
    let undefinedOccurrences = [];
    let unusedOccurrences = [];
    let result = true;
    logger = context.logger;
    const include = options?.include || [];
    const paths = options?.paths || [];

    try {
        const includedProjectPaths = await getSharedProjectsPath(include);
        const includedPaths = includedProjectPaths.concat(paths);
        undefinedOccurrences = await getUndefinedOccurrences(projectRootPath, includedPaths);
        unusedOccurrences = await getUnusedOccurrences(projectRootPath, includedPaths);

        if (undefinedOccurrences.length > 0) {
            result = false;
            logger.info(chalk.green(JSON.stringify(undefinedOccurrences, null, 4), '\n'));
            logger.error(`Found ${undefinedOccurrences.length} undefined translation keys \n`);
        }

        if (unusedOccurrences.length > 0) {
            logger.info(chalk.green(JSON.stringify(unusedOccurrences, null, 4), '\n'));
            logger.warn(`Found ${unusedOccurrences.length} unused translation keys \n`);
        }

        if (!undefinedOccurrences.length && !unusedOccurrences.length) {
            logger.info(chalk.green(`Success - No unused or undefined translation keys found \n`));
        }
    } catch (err) {
        logger.error(err);
        result = false;
    }
    return result;
}
