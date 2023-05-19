/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { SortByCategoryMapperService, ItemsByCategory } from '@alfresco/adf-core';

export interface ListByCategoryProcess {
    id: string;
    key: string;
    name: string;
    category?: string;
    description?: string;
}

const DEFAULT_CATEGORIES = [
    '',
    'http://bpmn.io/schema/bpmn',
    'http://www.activiti.org/processdef',
    'http://www.activiti.org/test'
];

@Component({
    selector: 'process-list-by-category',
    templateUrl: './process-list-by-category.component.html',
    styleUrls: ['./process-list-by-category.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessListByCategoryComponent implements OnInit, OnChanges {
    @Input() processes: ListByCategoryProcess[] = [];
    @Input() recentDefinitionKeys: string[] = [];
    @Input() showLoadingSpinner = false;

    @Output() selectProcess = new EventEmitter<ListByCategoryProcess>();

    searchProcessText = new UntypedFormControl('');
    filteredProcesses: ItemsByCategory<ListByCategoryProcess>[] = [];
    recentProcesses: ListByCategoryProcess[] = [];

    constructor(
        private categoryMapper: SortByCategoryMapperService<ListByCategoryProcess>
    ) {}

    ngOnInit(): void {
        this.searchProcessText.valueChanges.subscribe(() => {
            this.setFilteredProcesses(this.processes);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        const processesChanges = changes['processes'];
        const recentProcesses = changes['recentDefinitionKeys'];

        if (processesChanges?.currentValue !== processesChanges?.previousValue) {
            const newProcesses: ListByCategoryProcess[] = processesChanges.currentValue ?? [];

            this.setFilteredProcesses(newProcesses);
            this.setRecentProcessDefinitions(newProcesses, this.recentDefinitionKeys);
        }

        if (recentProcesses?.currentValue !== recentProcesses?.previousValue) {
            this.setRecentProcessDefinitions(this.processes, recentProcesses.currentValue ?? []);
        }
    }

    onSelectProcess(process: ListByCategoryProcess): void {
        this.selectProcess.emit(process);
    }

    private setFilteredProcesses(processes: ListByCategoryProcess[]): void {
        const filteredProcesses = this.filterProcessesBySearchText(processes, this.searchProcessText.value);

        this.filteredProcesses = this.categoryMapper.mapItems(filteredProcesses, DEFAULT_CATEGORIES);
    }

    private filterProcessesBySearchText(
        processes: ListByCategoryProcess[],
        searchValue: string,
    ): ListByCategoryProcess[] {
        return processes.filter((process) => process.name.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) > -1);
    }

    private setRecentProcessDefinitions(processes: ListByCategoryProcess[] = [], recentProcessesKeys: string[] = []): void {
        this.recentProcesses = recentProcessesKeys
            .map(recentKey => processes.find(process => process.key === recentKey))
            .filter((recentProcess): recentProcess is ListByCategoryProcess  => !!recentProcess);
    }
}
