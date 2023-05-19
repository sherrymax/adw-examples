# Docker support for ADW

[![Docker Repository on Quay](https://quay.io/repository/alfresco/alfresco-digital-workspace/status?token=8187ab94-595c-4cb8-8271-5edef643d93f "Docker Repository on Quay")](https://quay.io/repository/alfresco/alfresco-digital-workspace)

You can find Docker images in [Quay.io](https://quay.io/repository/alfresco/alfresco-digital-workspace?tab=tags)

* __content-ee__ development tags have the suffix `-adw` 
* __content-ee-cloud__ release tags follow APA release versions 

## Environment Variables

Each Docker image provides support for a range of environment variables that you can use to modify the configuration files or application behavior.

| Name | `app.config.json` mapping |
| --- | --- |
| APP_CONFIG_BPM_HOST | bpmHost |
| APP_CONFIG_ECM_HOST | ecmHost |
| APP_CONFIG_PROVIDER | providers |
| APP_CONFIG_AUTH_TYPE | authType |
| APP_CONFIG_IDENTITY_HOST | identityHost |
| APP_CONFIG_ALFRESCO_REPO_NAME | alfrescoRepositoryName |
| APP_BASE_SHARE_URL | baseShareUrl |
| APP_CONFIG_OAUTH2_HOST | oauth2.host |
| APP_CONFIG_OAUTH2_CLIENTID | oauth2.clientId |
| APP_CONFIG_OAUTH2_IMPLICIT_FLOW | oauth2.implicitFlow |
| APP_CONFIG_OAUTH2_SILENT_LOGIN | oauth2.silentLogin |
| APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI | oauth2.redirectSilentIframeUri |
| APP_CONFIG_OAUTH2_REDIRECT_LOGIN | oauth2.redirectUri |
| APP_CONFIG_OAUTH2_REDIRECT_LOGOUT | oauth2.redirectUriLogout |
| APP_CONFIG_MICROSOFT_ONLINE_OOI_URL | msOnline.msHost |
| APP_CONFIG_MICROSOFT_ONLINE_CLIENTID | msOnline.msClientId |
| APP_CONFIG_MICROSOFT_ONLINE_AUTHORITY | msOnline.msAuthority |
| APP_CONFIG_MICROSOFT_ONLINE_REDIRECT | msOnline.msRedirectUri |
| APP_CONFIG_APPS_DEPLOYED | alfresco-deployed-apps |
| APP_CONFIG_CUSTOM_MODELED_EXTENSION | custom-modeled-extension |
| APP_CONFIG_PLUGIN_PROCESS_SERVICE | processService |
| APP_CONFIG_PLUGIN_MICROSOFT_ONLINE | microsoftOnline |
| APP_CONFIG_PLUGIN_AOS | aos |
| APP_CONFIG_PLUGIN_FOLDER_RULES | folderRules
| APP_CONFIG_PLUGIN_AI_SERVICE | ai |
| APP_CONFIG_PLUGIN_CONTENT_SERVICE | contentService |

There are also application-specific variables:

| Name | Description |
| --- | --- |
| BASE_PATH | Path to mount the app at |
