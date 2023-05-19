# AdfProcessServicesExtension

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.5.

## Code scaffolding

Run `ng generate component component-name --project process-services-extension` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project process-services-extension`.

> Note: Don't forget to add `--project process-services-extension` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build process-services-extension` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build process-services-extension`, go to the dist folder `cd dist/process-services-extension` and run `npm publish`.

## Running unit tests

Run `ng test process-services-extension` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Enable the plugin

The Process Service plugin allow you to manage the processes/tasks available in activiti

### Prerequisites

- APS 1.11 with identity service running
![APS-running](/libs/content-ee/process-services-extension/doc/activiti-1.11-running.png)
- ACS 6.2.1 configured with identity service
- ADW configured with identity service
![ADW SSO](/libs/content-ee/process-services-extension/doc/adw-ecm-bpm-sso.png)
- Enable the plugin
Navigate to the setting page (http://domain.com/#/setting)
Enable the Process Service Plugin
![Process Service Plugin](/libs/content-ee/process-services-extension/doc/setting-page-enable-plugin.png)
Click on the logo to go back on the home and refresh the page.

Once the plugin is enabled you should be able to see the Process Management section on the navigation bar and check the
Process List
![Process Management](/libs/content-ee/process-services-extension/doc/process-list.png)
Task List
![Process Management](/libs/content-ee/process-services-extension/doc/task-list.png)
Ability to start a process from a content
![Process Management](/libs/content-ee/process-services-extension/doc/start-process-from-content.png)
