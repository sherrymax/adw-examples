{
    "bpmHost": "${APP_CONFIG_BPM_HOST}",
    "ecmHost": "${APP_CONFIG_ECM_HOST}",
    "aosHost": "${APP_CONFIG_ECM_HOST}/alfresco/aos",
    "baseShareUrl": "${APP_BASE_SHARE_URL}",
    "providers": "${APP_CONFIG_PROVIDER}",
    "identityHost": "${APP_CONFIG_IDENTITY_HOST}",
    "plugins":{
        "aosPlugin" : ${APP_CONFIG_PLUGIN_AOS}
    },
    "landingPage": "${APP_CONFIG_LANDING_PAGE}",
    "application": {
        "name": "Alfresco Digital Workspace",
        "version": "2.0.0-M10",
        "headerImagePath": "assets/images/mastHead-bg-shapesPattern.svg",
        "logo": "assets/images/alfresco-logo-flower.svg",
        "copyright": "APP.COPYRIGHT"
    },
    "oauth2": {
        "host": "${APP_CONFIG_OAUTH2_HOST}",
        "clientId": "${APP_CONFIG_OAUTH2_CLIENTID}",
        "scope": "openid profile email",
        "secret": "",
        "implicitFlow": ${APP_CONFIG_OAUTH2_IMPLICIT_FLOW},
        "silentLogin": ${APP_CONFIG_OAUTH2_SILENT_LOGIN},
        "publicUrls": [
            "**/preview/s/*",
            "**/settings",
            "**/blank"
        ],
        "redirectSilentIframeUri": "${APP_CONFIG_OAUTH2_REDIRECT_SILENT_IFRAME_URI}",
        "redirectUri": "${APP_CONFIG_OAUTH2_REDIRECT_LOGIN}",
        "redirectUriLogout": "${APP_CONFIG_OAUTH2_REDIRECT_LOGOUT}"
    },
    "notificationsPooling": 30000,
    "alfresco-deployed-apps": ${APP_CONFIG_APPS_DEPLOYED},
    "custom-modeled-extension": ${APP_CONFIG_CUSTOM_MODELED_EXTENSION},
    "analytics": {
        "pendo": {
            "enabled" : "${APP_CONFIG_ANALYTICS_PENDO_ENABLED}",
            "key": "${APP_CONFIG_ANALYTICS_PENDO_KEY}",
            "disableGuides": "${APP_CONFIG_ANALYTICS_PENDO_DISABLE_GUIDES}",
            "excludeAllText": "${APP_CONFIG_ANALYTICS_PENDO_EXCLUDE_ALL_TEXT}"
        }
    },
    "customer": {
        "name": "${APP_CONFIG_CUSTOMER_NAME}"
    }
}
