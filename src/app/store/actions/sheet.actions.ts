import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Sheet } from '../models/sheet';

@Injectable()
export class SheetActions {

    static ADD_SHEET = 'ADD_SHEET';
    static SET_SHEETS = 'ADD_SHEETS';
    static UPDATE_SHEET = 'UPDATE_SHEET';
    static DELETE_SHEET = 'DELETE_SHEET';

    addSheets(sheets: Array<Sheet>): Action {
        return {
            type: SheetActions.SET_SHEETS,
            payload: sheets
        };
    }

    addSheet(sheet: Sheet): Action {
        return {
            type: SheetActions.ADD_SHEET,
            payload: sheet
        };
    }

    updateSheet(entity: Sheet): Action {
        return {
            type: SheetActions.UPDATE_SHEET,
            payload: sheet
        };
    }

    deleteSheet(entity: Sheet): Action {
        return {
            type: SheetActions.DELETE_SHEET,
            payload: sheet
        };
    }
}
