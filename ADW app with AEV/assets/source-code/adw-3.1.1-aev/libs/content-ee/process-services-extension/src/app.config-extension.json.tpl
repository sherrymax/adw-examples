{
  "plugins": {
    "processService": ${APP_CONFIG_PLUGIN_PROCESS_SERVICE}
  },
  "adf-start-process": {
    "name": "%{processDefinition} - %{datetime}",
    "processDefinitionName": ""
  },
  "totalQuickStartProcessDefinitions": 5,
  "adf-task-list": {
    "presets": {
      "default": [
        {
          "key": "name",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.NAME",
          "cssClass": "adf-data-table-cell--ellipsis adf-expand-cell-2",
          "sortable": true,
          "desktopOnly": false
        },
        {
          "key": "dueDate",
          "type": "date",
          "title": "ADF_TASK_LIST.PROPERTIES.DUE_DATE",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        },
        {
          "key": "created",
          "type": "date",
          "title": "ADF_TASK_LIST.PROPERTIES.CREATED",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        },
        {
          "key": "priority",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.PRIORITY",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        }
      ],
      "completed": [
        {
          "key": "name",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.NAME",
          "cssClass": "adf-data-table-cell--ellipsis adf-expand-cell-2",
          "sortable": true,
          "desktopOnly": false
        },
        {
          "key": "created",
          "type": "date",
          "title": "ADF_TASK_LIST.PROPERTIES.CREATED",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        },
        {
          "key": "priority",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.PRIORITY",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        }
      ],
      "aps-process-task-list": [
        {
          "key": "name",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.NAME",
          "cssClass": "adf-data-table-cell--ellipsis adf-expand-cell-2",
          "sortable": true,
          "desktopOnly": false
        },
        {
          "key": "dueDate",
          "type": "date",
          "title": "ADF_TASK_LIST.PROPERTIES.DUE_DATE",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "format": "timeAgo",
          "sortable": true,
          "desktopOnly": true
        },
        {
          "key": "created",
          "type": "date",
          "title": "ADF_TASK_LIST.PROPERTIES.CREATED",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        },
        {
          "key": "priority",
          "type": "text",
          "title": "ADF_TASK_LIST.PROPERTIES.PRIORITY",
          "cssClass": "adf-desktop-only adf-ellipsis-cell",
          "sortable": true,
          "desktopOnly": true
        }
      ]
    }
  },
  "adf-process-list": {
    "presets": {
      "running": [
        {
          "key": "name",
          "type": "text",
          "title": "ADF_PROCESS_LIST.PROPERTIES.NAME",
          "cssClass": "adf-data-table-cell--ellipsis adf-expand-cell-2",
          "sortable": true
        },
        {
          "key": "started",
          "type": "date",
          "title": "ADF_PROCESS_LIST.PROPERTIES.CREATED",
          "format": "timeAgo",
          "cssClass": "adf-desktop-only",
          "sortable": true
        }
      ],
      "default": [
        {
          "key": "name",
          "type": "text",
          "title": "ADF_PROCESS_LIST.PROPERTIES.NAME",
          "cssClass": "adf-data-table-cell--ellipsis adf-expand-cell-2",
          "sortable": true
        },
        {
          "key": "started",
          "type": "date",
          "title": "ADF_PROCESS_LIST.PROPERTIES.CREATED",
          "format": "timeAgo",
          "cssClass": "adf-desktop-only",
          "sortable": true
        },
        {
          "key": "ended",
          "type": "date",
          "title": "ADF_PROCESS_LIST.PROPERTIES.END_DATE",
          "cssClass": "adf-desktop-only",
          "sortable": true
        }
      ]
    }
  }
}
