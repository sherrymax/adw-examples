/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const path = require('path');

export const Applications = {
    APPLICATION: {
        title: 'e2e-Application',
        process_candidate_users_with_form: 'e2e-candidate_users_with_form-process',
        process_candidate_users_no_permissions_with_form: 'e2e-candidate_users_no_permissions_with_form-process',
        process_generate_documents: 'e2e-generate_document-process',

        process_display_value: 'e2e-displayValue-process',
        form_widgets_displayValue: {
            /* cspell: disable-next-line */
            attach_file_widget_onStartForm_id: 'attachphotohere',
            /* cspell: disable-next-line */
            displayValue_of_attach_file_widget_id: 'displayvalue_attachphotohere',
        },

        process_attach_file_on_start_form: 'e2e-attach_file_on_start_event-process',
        process_attach_multiple_file_on_start_form: 'e2e-attach_multiple_file_on_start_event-process',
        form_widgets_attachOnStartForm: {
            single_type_attach_file_form_id: 'attachfilesingletype',
            multiple_type_attach_file_form_id: 'attachmultiplefiles',
        },

        process_twoUserTasks: 'e2e-twoUserTasks-process',
        firstUserTask: 'firstUserTask',
        secondUserTask: 'secondUserTask',

        process_noForm: 'e2e-noForm-process',
        process_queued_noForm: 'e2e-queued_noForm-process',

        process_single: 'e2e-attach_file_single_all-process',
        process_local: 'e2e-attach_file_local-process',
        process_all: 'e2e-attach_file_all-process',
        process_acs: 'e2e-attach_file_acs-process',
        process_single_multiple: 'e2e-attach_file_single_multiple-process',
        process_visible: 'e2e-attach_file_visible-process',
        process_invisible: 'e2e-attach_file_invisible-process',
        form_widgets: {
            single_local_id: 'singlelocal',
            single_all_id: 'singleall',
            single_acs_id: 'singleacs',
            multiple_local_id: 'multiplelocal',
            multiple_all_id: 'multipleall',
            multiple_acs_id: 'multipleacs',
            checkbox_id: 'checkbox',
            single_all_visible_id: 'singleallvisible',
        },
        form_name: {
            process_single_form: 'User task of single all attach file widget',
            process_local_form: 'User task of local attach file widgets',
            process_all_form: 'User task of all attach file widgets',
            process_acs_form: 'User task of acs attach file widgets',
            process_single_multiple_form: 'User task of attach file widget single and multiple',
            process_visible_form: 'User task of attach file widget visible',
            process_invisible_form: 'User task of attach file widget invisible',
        },
    },
    BASIC_APP: {
        file_location: path.join(__dirname, '/e2e-basic-app.zip'),
        title: 'e2e-basic-app',
        basic_process: 'e2e-basic-process',
    },

    setUserTaskName: 'setusertaskname',
    setSecondUserTaskName: 'setsecondusertaskname',
};

export const Content = {
    PNG: {
        file_location: path.join(__dirname, '/content/e2e_share_profile_pic.png'),
        file_name: 'e2e_share_profile_pic.png',
    },
    JPG: {
        file_location: path.join(__dirname, '/content/e2e_share_profile_pic.jpg'),
        file_name: 'e2e_share_profile_pic.jpg',
    },
    SHARE: {
        file_location: path.join(__dirname, '/content/e2e_share_file.jpg'),
        file_name: 'e2e_share_file.jpg',
    },
    LOCK: {
        file_location: path.join(__dirname, '/content/e2e_lock.png'),
        file_name: 'e2e_lock.png',
    },
    SECOND_LOCK: {
        file_location: path.join(__dirname, '/content/e2e_second_lock.png'),
        file_name: 'e2e_second_lock.png',
    },
    TO_BE_DELETED: {
        file_location: path.join(__dirname, '/content/e2e_to_be_deleted.png'),
        file_name: 'e2e_to_be_deleted.png',
    },
    FAVORITE: {
        file_location: path.join(__dirname, '/content/e2e_favorite_file.jpg'),
        file_name: 'e2e_favorite_file.jpg',
    },
};

export const Folder = {
    E2E_FOLDER: {
        folder_name: 'e2e-test-data',
    },
};
