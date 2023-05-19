/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export class MatSelectHelper {
    private container: OverlayContainer;
    private containerElement: HTMLElement;
    private trigger: HTMLElement;

    public constructor(private fixture: ComponentFixture<any>) {
        inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
            this.container = overlayContainer;
            this.containerElement = overlayContainer.getContainerElement();
        })();
    }

    public triggerMenu() {
        this.fixture.detectChanges();
        this.trigger = this.fixture.debugElement.query(By.css('.mat-select-trigger')).nativeElement;
        this.trigger.click();
        this.fixture.detectChanges();
    }

    public getOptions(): HTMLElement[] {
        return Array.from(this.containerElement.querySelectorAll('mat-option') as NodeListOf<HTMLElement>);
    }

    public selectOption(option: HTMLElement) {
        option.click();
        this.fixture.detectChanges();
        this.trigger.click();
        this.fixture.detectChanges();
    }

    public selectOptionByKey(options: HTMLElement[], key: string) {
        options.forEach((option: HTMLElement) => {
            if (option.innerText.trim() === key) {
                this.selectOption(option);
            }
        });
    }

    public cleanup() {
        this.container.ngOnDestroy();
    }
}
