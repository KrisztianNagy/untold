import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';

import {AppStore} from '../app-store';
import {GridTile} from '../models/grid-tile';
import {GridTileActions} from '../actions/grid-tile.actions';
import {GameService} from './game.service';

@Injectable()
export class GridService {
  updatedGridTiles: Subject<Array<GridTile>>;
  gridTiles: Observable<Array<GridTile>>;

  private current: Array<GridTile>;

  constructor(private store: Store<AppStore>,
              private gameService: GameService) {
    this.gridTiles = store.select(s => s.GridTiles);
    this.updatedGridTiles = new Subject<Array<GridTile>>();

    this.gridTiles.subscribe(gridTiles => {
      this.current = gridTiles;
    });

    this.gameService.selectedGame.subscribe(game => {
      if (!game || !game.localMembership || !game.localMembership.activeMap) {
        return;
      }

      this.loadTilesFromMaster(game.localMembership.activeMap.gridJson);
    });
  }

  loadBlankGrid(): Array<GridTile> {
    const gridSize = 100;

    let grid: Array<GridTile> = [];
    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= gridSize; j++) {
        grid.push({
          row: i - 1,
          column: j - 1,
          isBlock: false,
        });
      }
    }

    return grid;
  }

  loadTilesFromMaster(gridJson: string) {
     let grid = this.loadBlankGrid();
      const blocks: Array<GridTile> = gridJson ? JSON.parse(gridJson) : [];

      blocks.forEach(tile => {
        for (let i = 0; i < grid.length; i++) {
          if (grid[i].column === tile.column && grid[i].row === tile.row) {
            grid[i].isBlock = true;
          }
        }
      });

      this.store.dispatch({ type: GridTileActions.ADD_GRID, payload: grid });
      this.updatedGridTiles.next(grid);
  }

  updateGridTile(gridTile: GridTile) {
    this.store.dispatch({ type: GridTileActions.UPDATE_GRIDTILE, payload: gridTile });
    this.updatedGridTiles.next([gridTile]);
  }

  SetTiles(gridTiles: Array<GridTile>) {
    this.store.dispatch({ type: GridTileActions.ADD_GRID, payload: gridTiles });
    this.updatedGridTiles.next(gridTiles);
  }

  getCurrent(): Array<GridTile> {
    return this.current;
  }

  getByName(name: string): GridTile {
    const row = parseInt( name.split('|')[0], 10);
    const column = parseInt( name.split('|')[1], 10);

    return this.getByPosition(row, column);
  }

  getByPosition(row: number, column: number): GridTile {
    const gridTile = this.getCurrent().filter(tile => {
      return tile.row === row && tile.column === column;
    })[0];

    return gridTile;
  }
}
