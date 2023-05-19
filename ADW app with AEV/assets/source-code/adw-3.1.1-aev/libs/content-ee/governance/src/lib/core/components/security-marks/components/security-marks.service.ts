/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SecurityGroup,
    SecurityGroupEntry,
    SecurityGroupPaging,
    SecurityGroupsApi,
    SecurityMark,
    SecurityMarkEntry,
    SecurityMarkPaging,
    SecurityMarksApi,
    NodeSecurityMarksApi,
    NodeSecurityMarkBody} from '@alfresco/js-api';
import { SecurityGroupResponse } from './security-group-response.interface';
import { SecurityMarkResponse } from './security-mark-response.interface';
import { AlfrescoApiService, NotificationService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

const DEFAULT_INCLUDE = 'inUse';

@Injectable({ providedIn: 'root' })
export class SecurityMarksService {
    private securityGroup: SecurityGroupsApi;
    private securityMark: SecurityMarksApi;
    private nodeSecurityMark: NodeSecurityMarksApi;
    private mapOfSecurityGroupAndMark = new Map<SecurityGroup, SecurityMark[]>();

    constructor(
        private apiService: AlfrescoApiService,
        private notificationService: NotificationService
    ) {}

    get nodeMarksApi() {
        return (
            this.nodeSecurityMark ||
          (this.nodeSecurityMark = new NodeSecurityMarksApi(
              this.apiService.getInstance()
          ))
        );
    }

    get groupsApi() {
        return (
            this.securityGroup ||
          (this.securityGroup = new SecurityGroupsApi(
              this.apiService.getInstance()
          ))
        );
    }

    get securityDataMap(){
      this.getSecurityGroup()
          .then((data) =>
                this.getSecurityMarks(data.entries))
          .catch((error) => {
                throwError(error);
          });

        return this.mapOfSecurityGroupAndMark;
    }

    getSecurityMarks(groups: SecurityGroup[]){
      this.mapOfSecurityGroupAndMark.clear();

      groups.forEach(
        group =>
          this.getSecurityMark(group.id)
            .then(marks => {this.mapOfSecurityGroupAndMark.set(group, marks.entries);})
      );
    }

    get marksApi(): SecurityMarksApi {
        return (
            this.securityMark ||
          (this.securityMark = new SecurityMarksApi(
              this.apiService.getInstance()
          ))
        );
    }

    getSecurityGroup(): Promise<SecurityGroupResponse> {
        return new Promise((resolve, reject) => {
            this.groupsApi
                .getSecurityGroups({
                    DEFAULT_INCLUDE
                })
                .then((response: SecurityGroupPaging) => {
                    const securityGroupResponse = {
                        entries: response?.list?.entries
                                    ?.filter(groupEntry => !groupEntry.entry.systemGroup)
                                    ?.map((group: SecurityGroupEntry) => group.entry)
                    };
                    resolve(securityGroupResponse);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    getSecurityMark(
      securityGroupId: string, include = DEFAULT_INCLUDE):
      Promise<SecurityMarkResponse> {

      return new Promise((resolve, reject) => {
        this.marksApi
            .getSecurityMarks(securityGroupId, {
                include
            })
            .then((response: SecurityMarkPaging) => {
                    const securityMarkResponse = {
                        entries: response?.list?.entries?.map(
                            (mark: SecurityMarkEntry) => mark.entry)
                    };
                    resolve(securityMarkResponse);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    onSave(nodeId: string, array: Array<NodeSecurityMarkBody>) {
        this.nodeMarksApi
            .manageSecurityMarksOnNode(nodeId, array)
            .catch(() => {
                this.notificationService.showError('GOVERNANCE.SECURITY_MARKS.EDIT_SECURITY_MARKS_ERROR');
            });
    }

    getNodeSecurityMarks(nodeId: string,
                         include = DEFAULT_INCLUDE): Promise<SecurityMarkPaging>{

        return this.nodeMarksApi.getSecurityMarksOnNode(nodeId, {include});
    }
}
