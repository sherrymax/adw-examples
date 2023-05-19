# About this repository

## Introduction

The repository is a "monorepo", hosting multiple applications and libraries, based on
[Alfresco Application Development Framework (ADF)](https://github.com/Alfresco/alfresco-ng2-components) components.

## Installing dependencies

Run the following command to install all third-party dependencies:

```bash
npm ci
```

## Setting up environment variables

Each application requires various environment variables to be set. To see which variables you need to set for an application or its e2e, please refer to the specific app's README.md (which can be found under `./apps/<app-name>/README.md`).  *Between the apps, you may find many overlapping variables with the same value.*

After collecting the necessary env vars for the application you want to run/build/test/etc in the project root folder create a `.env` file (this is gitignored) for containing those, like this:

```bash
VAR_NAME1="<url>"
VAR_NAME2=true
```

## Running an application 

Use one of the following commands to run the application:

```bash
# Development server
npm start <app-name>

# Production server
npm start <app-name> -- --prod
```
*where `app-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

## Building an application

Use one of the following commands to build the application:

```bash
# develop build
npm run build <app-name>

# Production build
npm run build <app-name> -- --prod
```
*where `app-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

## Running unit tests

Use the following command to run the unit tests:

```bash
# Test runner command in CI
npm test <project name>
```
*where `project-name` refers the project's name found in the workspace configuration (angular.json or the related project.jsons).*

Please - when passing other unit test runner options - be aware that some of the applications might be using [karma](http://karma-runner.github.io/4.0/config/configuration-file.html), while other applications and its libraries might be using [jest](https://jestjs.io/docs/en/23.x/cli).
*To understand which project uses what, please check the workspace configuration (angular.json or the related project.jsons).*

## Generating code coverage
Karma can generate code coverage with Istanbul plugin. 
The coverage folder will be created in the root folder by running:

```bash
# Generate code coverage for a specific project
nx test <project name> --codeCoverage

# Generate code coverage for everything
nx affected:test -- --all --code-coverage
```

## Further app specific README-s

For further information please see the README file of every app in their root directory.

## See Also

Check also the [README](./developer-docs/README.md) in developer docs
