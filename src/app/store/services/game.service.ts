import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import {AppStore} from '../app-store';
import {Untold} from '../../shared/models/backend-export';
import {SelectedGameActions} from '../actions/selected-game.actions';

@Injectable()
export class GameService {
  selectedGame: Observable<Untold.ClientGameRealmDetails>;
  private current: Untold.ClientGameRealmDetails;

  constructor(private store: Store<AppStore>) {
    this.selectedGame = this.store.select(s => s.SelectedGame);
    this.current = null;

    this.selectedGame.subscribe(game => {
      this.current = game;
    });
  }

  updateUserStatus(userName: string, isOnline: boolean) {
    if (this.current) {
      const game: Untold.ClientGameRealmDetails = JSON.parse(JSON.stringify(this.current));

      game.members.forEach(member => {
        if (member.user.userName === userName) {
          member.isOnline = isOnline;
        }
      });

      this.selectGame(game);
    }
  }

  updateMemberMap(map: Untold.ClientMap, member: Untold.ClientUserRealmMembership) {
    if (this.current) {
      const game: Untold.ClientGameRealmDetails = JSON.parse(JSON.stringify(this.current));

      if (!member) {
        game.localMembership.activeMap = map;
        member = game.localMembership;
      } else {
        member.activeMap = map;
      }

      game.members.forEach(mem => {
        if (mem.user.id === member.user.id) {
          mem.activeMap = member.activeMap;
        }
      });

      this.selectGame(game);
    }
  }

  selectGame(game: Untold.ClientGameRealmDetails) {
    this.store.dispatch({ type: SelectedGameActions.SET_SELECTED_GAME, payload: game ? game : {} });
  }

  getCurrent(): Untold.ClientGameRealmDetails {
    return this.current;
  }
}
