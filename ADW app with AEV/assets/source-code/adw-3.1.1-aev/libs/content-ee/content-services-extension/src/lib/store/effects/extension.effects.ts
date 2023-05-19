/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ADD_MEMBER, AddMemberAction, MANAGE_MEMBERS, ManageMembersAction } from '../extension.actions';
import { mergeMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LibraryDialogService } from '../../components/library-member-management';

@Injectable()
export class ExtensionEffects {
    constructor(private actions$: Actions, private router: Router, private libraryDialogService: LibraryDialogService) {}


    addMember$ = createEffect(() => this.actions$.pipe(
        ofType<AddMemberAction>(ADD_MEMBER),
        mergeMap((action: any) => this.libraryDialogService.openAddLibraryMemberDialog(action.payload, action.members))
    ), { dispatch: false });


    manageMembers$ = createEffect(() => this.actions$.pipe(
        ofType<ManageMembersAction>(MANAGE_MEMBERS),
        tap((action: any) => this.router.navigateByUrl(`/${action.payload.entry.id}/members/libraries`))
    ), { dispatch: false });
}
