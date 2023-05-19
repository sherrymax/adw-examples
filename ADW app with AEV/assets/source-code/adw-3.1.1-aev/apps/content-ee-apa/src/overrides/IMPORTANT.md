## Extending Application ##

Whenever the application extends other application, we are using `fileReplacements` option in `project.js` in order to override extended application behaviour. All these files are stored in `overrides` folder.

### Note ###
After upgrading to Angular 13, we were facing issues with modules moved by `fileReplacements` option.

Issue is related to wrongly generated import path for modules which uses `forRoot` method in `@NgModule.imports` decorator.

In order to mitigate the issue, replaced files need to be stored in the same folder structure in terms of number of nested folders e.g.

```
application-ee/src/overrides/app/application.module.ts
application-ce/app/src      /app/application.module.ts
```
