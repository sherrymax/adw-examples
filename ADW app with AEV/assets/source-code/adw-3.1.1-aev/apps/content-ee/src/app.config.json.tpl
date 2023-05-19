{
    "bpmHost": "${APP_CONFIG_BPM_HOST}",
    "ecmHost": "${APP_CONFIG_ECM_HOST}",
    "aosHost": "${APP_CONFIG_ECM_HOST}/alfresco/aos",
    "baseShareUrl": "${APP_BASE_SHARE_URL}",
    "providers": "${APP_CONFIG_PROVIDER}",
    "identityHost": "${APP_CONFIG_IDENTITY_HOST}",
    "authType": "${APP_CONFIG_AUTH_TYPE}",
    "plugins":{
        "aosPlugin" : ${APP_CONFIG_PLUGIN_AOS}
    },
    "application": {
        "name": "Alfresco Digital Workspace",
        "version": "2.0.0-M2",
        "headerImagePath": "assets/images/mastHead-bg-shapesPattern.svg",
        "logo": "assets/images/alfresco-logo-flower.svg",
        "copyright": "APP.COPYRIGHT"
    },
    "upload": {
        "threads": 3
    },
    "oauth2": {
        "host": "${APP_CONFIG_OAUTH2_HOST}",
        "clientId": "alfresco",
        "scope": "openid profile email",
        "secret": "",
        "implicitFlow": true,
        "silentLogin": true,
        "publicUrls": [
            "**/preview/s/*",
            "**/settings",
            "**/blank"
        ],
        "redirectSilentIframeUri": "${APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI}",
        "redirectUri": "${APP_CONFIG_OAUTH2_REDIRECT_LOGIN}",
        "redirectUriLogout": "${APP_CONFIG_OAUTH2_REDIRECT_LOGOUT}"
    },
    "notificationsPooling": 30000
}
