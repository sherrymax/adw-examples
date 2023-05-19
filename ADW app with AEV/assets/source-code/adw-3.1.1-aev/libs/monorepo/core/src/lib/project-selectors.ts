/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { WorkspaceConfig } from './workspace-config';

export const MAIN_E2E_APPS = [
    'modeling-ce-e2e',
    'modeling-ee-e2e',
    'admin-ee-e2e',
    'content-ce-e2e',
    'content-ee-governance-extension-e2e',
    'content-ee-process-services-extension-e2e',
    'content-ee-process-services-cloud-extension-e2e',
    'content-ee-custom-modeled-extension-e2e'
];

export const getProjects = () => {
    const workspaceConfig = new WorkspaceConfig();
    return workspaceConfig.getProjectNames()
        .map(projectName => ({name: projectName, ...workspaceConfig.getProject(projectName)}));
};

export const getApps = () => getProjects()
    .filter(project => project.projectType === 'application')
    .filter(project => project.name.indexOf('e2e') === -1);

export const getE2Es = () => getProjects()
    .filter(project => project.projectType === 'application' && project.name.endsWith('-e2e'));

export const getMainE2EApps = () => getE2Es()
    .filter(project => MAIN_E2E_APPS.includes(project.name));

export const getLibs = () => getProjects()
    .filter(project => project.projectType === 'library');
