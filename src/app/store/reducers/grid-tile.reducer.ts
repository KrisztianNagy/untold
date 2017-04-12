import {ActionReducer, Action} from '@ngrx/store';
import {GridTileActions} from '../actions/grid-tile.actions';
import {GridTile} from '../models/grid-tile';

let nextId = 0;

export function GridTileReducer(state = [], action) {
    switch (action.type) {
        case GridTileActions.ADD_GRID:
            return [...action.payload];
        case GridTileActions.UPDATE_GRIDTILE:
            return state.
                map((gridTile: GridTile) => {
                    return gridTile.row === action.payload.row && gridTile.column === action.payload.column ?
                        Object.assign({}, gridTile, action.payload) :
                        gridTile;
            });
        default:
            return state;
    };
}
