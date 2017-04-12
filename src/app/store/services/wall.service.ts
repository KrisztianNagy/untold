import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {AppStore} from '../app-store';
import {Wall} from '../models/wall';
import {WallActions} from '../actions/wall.actions';
import {UserWallActions} from '../actions/user-wall.actions';
import {InteractionService} from './interaction.service';

@Injectable()
export class WallService {
  calculatedWalls: Observable<Array<Wall>>;
  userWalls: Observable<Array<Wall>>;
  private calculatedValue: Array<Wall>;
  private userValue: Array<Wall>;

  constructor(private store: Store<AppStore>) {
    this.calculatedWalls = this.store.select(s => s.CalculatedWalls);
    this.userWalls = this.store.select(s => s.UserWalls);

    this.calculatedWalls.subscribe(wls => {
      this.calculatedValue = wls;
    });

    this.userWalls.subscribe(wls => {
      this.userValue = wls;
    });
  }

  setCalculatedWalls(walls: Wall[]) {
    this.store.dispatch({ type: WallActions.SET_WALLS, payload: walls });
  }

  addUserWall(wall: Wall) {
    this.store.dispatch({ type: UserWallActions.ADD_USERWALL, payload: wall });
  }

  deleteUserWall(wall: Wall) {
    this.store.dispatch({ type: UserWallActions.DELETE_USERWALL, payload: wall });
  }

  deleteUserWallById(id: number) {
    this.store.dispatch({ type: UserWallActions.DELETE_USERWALL, payload: {
        id: id
      }
    });
  }

  getCurrentCalculatedWalls(): Array<Wall> {
    return [...this.calculatedValue];
  }

  getCurrentUserWalls(): Array<Wall> {
    return [...this.userValue];
  }
}
