# Alfresco Digital Workspace
## About this application

This folder contains the source code of the Alfresco Digital Workspace applications, which is based on the Alfresco Content Application + "out of the box" Alfresco extensions.

Project structure is based on the [Nx Workspace](https://nx.dev/angular) dev tools for monorepos.

## App required environment variables

We need to set some environment variables to be able to run the local dev server. In the project root folder, create a `.env` file (this is gitignored) with the following data:

```bash
# App config settings
APP_CONFIG_BPM_HOST="<url>"
APP_CONFIG_ECM_HOST="<url>"
APP_CONFIG_OAUTH2_HOST="<url>"
APP_CONFIG_IDENTITY_HOST="<url>"
APP_CONFIG_PROVIDER="ALL"
APP_CONFIG_AUTH_TYPE="OAUTH"
APP_CONFIG_OAUTH2_CLIENTID="alfresco"
APP_CONFIG_OAUTH2_IMPLICIT_FLOW=true
APP_CONFIG_OAUTH2_SILENT_LOGIN=true
APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI="{protocol}//{hostname}{:port}/assets/silent-refresh.html"
APP_CONFIG_OAUTH2_REDIRECT_LOGIN=/
APP_CONFIG_OAUTH2_REDIRECT_LOGOUT=/
APP_CONFIG_APPS_DEPLOYED="[{"name": "simpleapp"}]"
APP_CONFIG_LANDING_PAGE="/personal-files"
APP_CONFIG_PLUGIN_FOLDER_RULES=true

# CONTENT RELATED
ACA_BRANCH="develop"
APP_CONFIG_PLUGIN_PROCESS_SERVICE=true
APP_CONFIG_PLUGIN_AI_SERVICE=true
APP_CONFIG_PLUGIN_AOS=true
APP_CONFIG_PLUGIN_FOLDER_RULES=true
APP_CONFIG_PLUGIN_CONTENT_SERVICE=true
APP_CONFIG_CUSTOM_MODELED_EXTENSION = "{}"

# CONTENT - MICROSOT PLUGIN RELATED
APP_CONFIG_PLUGIN_MICROSOFT_ONLINE=true
APP_CONFIG_MICROSOFT_ONLINE_OOI_URL="<url>"
APP_CONFIG_MICROSOFT_ONLINE_CLIENTID="<clientid>"
APP_CONFIG_MICROSOFT_ONLINE_AUTHORITY="<url>"
APP_CONFIG_MICROSOFT_ONLINE_REDIRECT="<url>"

# CONTENT - MICROSOT INTEGRATION TEST RELATED
MICROSOFT_USER_INITIALS="<user-initials>"
MICROSOFT_EMAIL="<email>"
MICROSOFT_USER2_INITIALS="<user-initials>"
MICROSOFT_EMAIL2="<email>"
MICROSOFT_PASSWORD="<password>"
MOO_LOGIN_URL="<url>"

# E2E settings
E2E_USE_MOCK_BACKEND=true
E2E_HOST="http://localhost"
E2E_PORT="4200"
BROWSER_RUN="true"
E2E_PREFIX="e2e"
SMART_RUNNER_DIRECTORY=".protractor-smartrunner"
SAVE_SCREENSHOT="true"
SCREENSHOT_URL="<url>"
SCREENSHOT_PASSWORD="<password>"
LOG_LEVEL="TRACE"
LOG=true

# Test user credentials
E2E_USERNAME="<username>"
E2E_PASSWORD="<password>"
E2E_UNAUTHORIZED_USER="<username>"
E2E_UNAUTHORIZED_USER_PASSWORD="<password>"
IDENTITY_USER_EMAIL="<username>"
IDENTITY_USER_PASSWORD="<password>"
SUPERADMIN_EMAIL="<username>"
SUPERADMIN_PASSWORD="<password>"
DEVOPS_EMAIL="<username>"
DEVOPS_PASSWORD="<password>"
MODELER_EMAIL="<username>"
MODELER_PASSWORD="<password>"
PROCESS_ADMIN_EMAIL="<username>"
PROCESS_ADMIN_PASSWORD="<password>"
HR_USER="<username>"
HR_USER_PASSWORD="<password>"
ADMIN_EMAIL="<email>"
ADMIN_PASSWORD="<password>"
```

### Applications

The workspace contains the following applications:

| Name | Description |
| --- | --- |
| Alfresco Content Application | The OS Alfresco Content Application, without any extensions |
| Alfresco Digital Workspace *(APS 1.x)* | Digital Workspace with the following extensions: adf-office-services, adf-ai, content-services, governance, about-page, settings-page, **process-services** |
| Alfresco Digital Workspace *(Alfresco Process Automation)* | Digital Workspace with the following extensions: adf-office-services, adf-ai, content-services, governance, about-page, settings-page, **process-services-cloud** |

### Libraries

The workspace contains the following libraries:

| Name | Description |
| --- | --- |
| adf-ai-extension | Smart Viewer extension |
| content-ee | various Content App extensions |
| content-services-extension | Alfresco Content Services extension |
| governance| Alfresco Governance extension |
| process-services-cloud-extension | Alfresco Process Automation extension |
| process-services-extension | Alfresco Process Services extension

For the full set of projects please refer to the "libs/content-ee" folder.
## Applications and distributions

As described above there are 2 different application to be run:

- **content-ce** (OS Alfresco Content Application)
- **content-ee** (Alfresco Digital Workspace)

In case of Digital Workspace we have 2 different distributions as well:

- **content-ee** (Alfresco Digital Workspace with APS 1.x extension)
- **content-ee-apa** (Alfresco Digital Workspace with Alfresco Process Automation extension)

The default application is set to be `content-ee`.

## Compiling without Extensions

To exclude any of the bundled extensions you need to update the `apps/content-ee/src/app/extensions.module.ts` file.

```ts
@NgModule({
    imports: [
        AosExtensionModule,
        AcaAboutModule,
        AcaSettingsModule,
        AiViewModule,
        RecordModule,
        ProcessServicesExtensionModule,
        ContentServicesExtensionModule,
        ExtensionsOrderExtensionModule,
    ],
})
export class AppExtensionsModule {}
```

Remove the modules that correspond to the extension you want to exclude from the build.

## See Also

- [Migration guide from 1.4.x to 2.0.x](/developer-docs/content-apps/upgrade-content-apps-from-1.[4,6].x-2.0.x.md)
- [Extending Alfresco Digital Workspace](/developer-docs/content-apps/extending.md)
- [Docker support for ADW](/developer-docs/content-apps/docker.md)
- [Enable the Process Service plugin](/libs/content-ee/process-services-extension/README.md)
- [How to use ACA](/developer-docs/content-apps/how-to-use-aca.md)

## Browser Support

The application is supported in the following browsers:

| **Browser**   | **Version** |
| ------------- | ----------- |
| Chrome        | Latest      |
| Safari (OS X) | Latest      |
| Firefox       | Latest      |
| Microsoft Edge | Latest     |
