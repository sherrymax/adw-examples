/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { UntypedFormArray, AbstractControl, Validators, UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ConnectorConfigParameter } from '../connector-config-parameter';
import { ConnectorContent } from '../connector-content';
import { OOBConnectors } from '../oob-connectors';

const lambdaConnector = require('./connectors/lambda.json');
const emailConnector = require('./connectors/email.json');
const restConnector = require('./connectors/rest.json');
const salesforceConnector = require('./connectors/salesforce.json');
const twilioConnector = require('./connectors/twilio.json');
const slackConnector = require('./connectors/slack.json');
const contentConnector = require('./connectors/content.json');
const comprehendConnector = require('./connectors/comprehend.json');
const docgenConnector = require('./connectors/docgenconnector.json');
const docusignConnector = require('./connectors/docusignconnector.json');
const rekognitionConnector = require('./connectors/rekognitionconnector.json');
const textractConnector = require('./connectors/textractconnector.json');
const mariadbConnector = require('./connectors/mariadb.json');
const postgresqlConnector = require('./connectors/postgresql.json');
const sqlserverConnector = require('./connectors/sqlserver.json');
const transcribeConnector = require('./connectors/transcribe.json');
const calendarConnector = require('./connectors/calendar.json');
const teamsConnector = require('./connectors/teams.json');

/* eslint-disable max-lines */
export interface CreateConnectorOptions {
    values?: { [key: string]: any };
    showSecureFields: boolean;
    isUpgrade?: boolean;
    connectorInfrastructure?: { image?: string };
}

@Injectable({ providedIn: 'root' })
export class ConnectorService {
    protected oobConnectors = {
        [OOBConnectors.COMPREHEND]: {
            icon: 'alfresco-oob-icon-comprehend',
            definition: comprehendConnector,
            svg: 'comprehend'
        },
        [OOBConnectors.CONTENT]: {
            icon: 'alfresco-oob-icon-content',
            definition: contentConnector,
            svg: 'content'
        },
        [OOBConnectors.DOCGEN]: {
            icon: 'alfresco-oob-icon-docgen',
            definition: docgenConnector,
            svg: 'docgen'
        },
        [OOBConnectors.DOCUSIGN]: {
            icon: 'alfresco-oob-icon-docusign',
            definition: docusignConnector,
            svg: 'docusign',
        },
        [OOBConnectors.EMAIL]: {
            icon: 'alfresco-oob-icon-email',
            definition: emailConnector,
            svg: 'email'
        },
        [OOBConnectors.LAMBDA]: {
            icon: 'alfresco-oob-icon-lambda',
            svg: 'lambda',
            definition: lambdaConnector
        },
        [OOBConnectors.REKOGNITION]: {
            icon: 'alfresco-oob-icon-rekognition',
            definition: rekognitionConnector,
            svg: 'rekognition'
        },
        [OOBConnectors.REST]: {
            icon: 'alfresco-oob-icon-rest',
            definition: restConnector,
            svg: 'rest'
        },
        [OOBConnectors.SALESFORCE]: {
            icon: 'alfresco-oob-icon-salesforce',
            definition: salesforceConnector,
            svg: 'salesforce'
        },
        [OOBConnectors.SLACK]: {
            icon: 'alfresco-oob-icon-slack',
            definition: slackConnector,
            svg: 'slack'
        },
        [OOBConnectors.TEXTRACT]: {
            icon: 'alfresco-oob-icon-textract',
            definition: textractConnector,
            svg: 'textract'
        },
        [OOBConnectors.TWILIO]: {
            icon: 'alfresco-oob-icon-twilio',
            definition: twilioConnector,
            svg: 'twilio'
        },
        [OOBConnectors.MARIADB]: {
            icon: 'alfresco-oob-icon-mariadb',
            definition: mariadbConnector,
            svg: 'mariadb'
        },
        [OOBConnectors.POSTGRESQL]: {
            icon: 'alfresco-oob-icon-postgresql',
            definition: postgresqlConnector,
            svg: 'postgresql'
        },
        [OOBConnectors.SQLSERVER]: {
            icon: 'alfresco-oob-icon-sqlserver',
            definition: sqlserverConnector,
            svg: 'sqlserver'
        },
        [OOBConnectors.TRANSCRIBE]: {
            icon: 'alfresco-oob-icon-transcribe',
            definition: transcribeConnector,
            svg: 'transcribe'
        },
        [OOBConnectors.CALENDAR]: {
            icon: 'alfresco-oob-icon-calendar',
            definition: calendarConnector,
            svg: 'calendar'
        },
        [OOBConnectors.TEAMS]: {
            icon: 'alfresco-oob-icon-teams',
            definition: teamsConnector,
            svg: 'teams'
        }
    };

    protected serviceConnectors = [OOBConnectors.DOCGEN, OOBConnectors.EMAIL, OOBConnectors.CONTENT];

    constructor(private formBuilder: UntypedFormBuilder) { }

    getDefinition(connectorName: OOBConnectors): ConnectorContent {
        const connector = this.oobConnectors[connectorName];

        if (connector && connector.definition) {
            return JSON.parse(JSON.stringify(connector.definition));
        }

        return null;
    }

    getIcon(connectorName: OOBConnectors): string {
        return this.oobConnectors[connectorName]?.icon;
    }

    getOOTBConnectors(includeContentConnector?: boolean): ConnectorContent[] {
        return this.getConnectors(includeContentConnector);
    }

    getOOTBConnectorsWithEvents(includeContentConnector?: boolean): ConnectorContent[] {
        return this.getConnectors(includeContentConnector, true, false);
    }

    getOOTBConnectorsWithOutServices(includeContentConnector?: boolean): ConnectorContent[] {
        return this.getConnectors(includeContentConnector, false, false);
    }

    getContentConnector(): ConnectorContent {
        return this.oobConnectors[OOBConnectors.CONTENT].definition;
    }

    getEmailConnector(): ConnectorContent {
        return this.oobConnectors[OOBConnectors.EMAIL].definition;
    }

    getDocgenConnector(): ConnectorContent {
        return this.oobConnectors[OOBConnectors.DOCGEN].definition;
    }

    private getConnectors(includeContentConnector?: boolean, includeConnectorsWithEvents?: boolean, includeServiceConnectors: boolean = true) {
        const connectorsMap = new Map<string, ConnectorContent>();
        for (const key in this.oobConnectors) {
            if (key === OOBConnectors.CONTENT.toString() && includeContentConnector) {
                connectorsMap.set(key, this.getConnectorDefinition(key));
            } else if (includeConnectorsWithEvents && this.connectorHasEvents(key)) {
                connectorsMap.set(key, this.getConnectorDefinition(key));
            } else if (!includeConnectorsWithEvents) {
                connectorsMap.set(key, this.getConnectorDefinition(key));
            }
        }
        if (!includeServiceConnectors) {
            this.deleteServiceTask(connectorsMap);
        }
        return Array.from(connectorsMap.values());
    }

    getSvg(connectorName: string): string {
        return this.oobConnectors[connectorName]?.svg;
    }

    createConnectorControl(connector: ConnectorContent, opts?: CreateConnectorOptions): AbstractControl {
        const config = connector.config || [];
        const isOOTBConnector = connector.template ? true : false;
        const isNewConnector = !(opts?.isUpgrade === true && opts.connectorInfrastructure);

        const connectorGroup = this.formBuilder.group({
            name: [
                {
                    value: connector.name,
                    disabled: true
                }
            ],
            image: [
                {
                    value: isOOTBConnector ? connector.image : (connector.image || opts.connectorInfrastructure?.image),
                    disabled: !isNewConnector || isOOTBConnector
                },
                isOOTBConnector ? null : Validators.required
            ],
            configs: this.createValueItems(config, opts),
            configurationChanged: isNewConnector,
            isNewConnector: isNewConnector
        });

        connectorGroup.get('configurationChanged').valueChanges.subscribe(configurationChanged => {
            if (configurationChanged) {
                if (!isOOTBConnector) {
                    connectorGroup.get('image').enable();
                }
                connectorGroup.get('configs').enable();
            } else {
                connectorGroup.get('image').disable();
                connectorGroup.get('configs').disable();
            }
        });

        return connectorGroup;
    }

    private createValueItems(params: ConnectorConfigParameter[], opts?: CreateConnectorOptions): UntypedFormArray {
        const configFormArray = new UntypedFormArray([]);
        const isNewConnector = !(opts?.isUpgrade === true && opts.connectorInfrastructure);
        const values = opts?.values || {};

        if (params && params.length > 0) {
            for (const config of params) {
                if (config.secure && !opts?.showSecureFields) {
                    continue;
                }

                const value = values[config.name] || config.value;
                const formConfig = new UntypedFormGroup({
                    name: new UntypedFormControl({ value: config.name, disabled: !isNewConnector }),
                    value: new UntypedFormControl({ value, disabled: !isNewConnector }, config.required ? Validators.required : null),
                    description: new UntypedFormControl({ value: config.description, disabled: !isNewConnector }),
                    required: new UntypedFormControl({ value: config.required || false, disabled: !isNewConnector }),
                    secure: new UntypedFormControl({ value: config.secure, disabled: !isNewConnector }),
                });

                configFormArray.push(formConfig);
            }
        }

        if (!isNewConnector) {
            configFormArray.disable();
        }

        return configFormArray;
    }

    getConnectorVariables(formArray: UntypedFormArray): any {
        const values = formArray.getRawValue();
        return this.buildConnectorsVariablesPayload(values);
    }

    private buildConnectorsVariablesPayload(connectorValues: any[]) {
        if (connectorValues && connectorValues.length > 0) {
            const payload = connectorValues
                .map((connector) => (connector.configs ? { [connector.name]: this.buildConnectorsVariablesPayloadFromConfig(connector.configs) } : {}))
                .filter((connector) => this.hasVariables(connector));

            return Object.assign({}, ...payload);
        }
        return {};
    }

    private buildConnectorsVariablesPayloadFromConfig(connectorConfig: any[]): any {
        const variablesPayload = {};

        connectorConfig.forEach((config) => {
            variablesPayload[config.name] = config.value;
        });

        return variablesPayload;
    }

    private hasVariables(connectorWithVariables: any): boolean {
        return connectorWithVariables && Object.keys(connectorWithVariables).length > 0;
    }

    public getConnectorDefinition(key: string) {
        return this.oobConnectors[key].definition;
    }

    private getConnectorDefinitionEvents(key: string) {
        return this.getConnectorDefinition(key).events;
    }

    private connectorHasEvents(key: string): boolean {
        return !!this.getConnectorDefinitionEvents(key);
    }

    public isServiceConnector(key: string): boolean {
        return this.serviceConnectors.map(service => service.toString()).includes(key);
    }

    private deleteServiceTask(connectorsMap: Map<string, ConnectorContent>) {
        Array.from(connectorsMap.keys()).forEach(key => {
            if (this.isServiceConnector(key)) {
                connectorsMap.delete(key);
            }
        });
    }
}
