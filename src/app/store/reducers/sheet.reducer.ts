import { ActionReducer, Action } from '@ngrx/store';
import { SheetActions } from '../actions/sheet.actions';
import { Sheet } from '../models/sheet';

export function SheetReducer(state = [], action) {
    switch (action.type) {
        case SheetActions.SET_SHEETS:
            return [...action.payload];
        case SheetActions.ADD_SHEET:
            return [...state, action.payload];
        case SheetActions.UPDATE_SHEET:
            return state.
                map((entity: Sheet) => {
                    return entity.id === action.payload.id ? Object.assign({}, entity, action.payload) : entity;
            });
        case SheetActions.DELETE_SHEET:
            return state.filter(entity =>
                entity.id !== action.payload.id);
        default:
            return state;
    };
}