import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import {AppStore} from '../app-store';
import {Interaction} from '../models/interaction';
import {InteractionActions} from '../actions/interaction.actions';
import {TokenService} from './token.service';

@Injectable()
export class InteractionService {
  private current: Interaction;
  interaction: Observable<Interaction>;

  constructor(private store: Store<AppStore>,
              private tokenService: TokenService) {
    this.interaction = store.select(s => s.Interaction);

    this.interaction.subscribe((intVal: Interaction) => {
      if (this.current && this.current.layerId !== intVal.layerId) {
       // this.tokenService.selectTokenById(-1);
      }

      this.current = intVal;
    });
  }

  update(interaction: Interaction) {
    this.store.dispatch({ type: InteractionActions.SET_INTERACTION, payload: interaction });
  }

  getCurrent(): Interaction {
    return this.current;
  }
}
