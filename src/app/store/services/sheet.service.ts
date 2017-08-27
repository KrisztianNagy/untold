import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../app-store';
import { Sheet } from '../models/sheet';
import { SheetActions } from '../actions/sheet.actions';

@Injectable()
export class SheetService {
    sheets: Observable<Sheet[]>;
    private current: Sheet[];

    constructor(private store: Store<AppStore>) {
        this.sheets = this.store.select(s => s.Sheets);

        this.sheets.subscribe(rt => {
        this.current = rt;
        });
    }

    setSheets(sheets: Sheet[]) {
        this.store.dispatch({ type: SheetActions.SET_SHEETS, payload: sheets });
    }

    addSheet(sheet: Sheet) {
        this.store.dispatch({ type: SheetActions.ADD_SHEET, payload: sheet });
    }

    updateSheet(sheet: Sheet) {
        this.store.dispatch({ type: SheetActions.UPDATE_SHEET, payload: sheet });
    }

    deleteSheet(sheet: Sheet) {
        this.store.dispatch({ type: SheetActions.DELETE_SHEET, payload: sheet });
    }

    getCurrent(): Sheet[] {
        return this.current;
    }
}
