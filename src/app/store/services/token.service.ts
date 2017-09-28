import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {AppStore} from '../app-store';
import {GameService} from './game.service';
import {Token} from '../models/token';
import {TokenActions} from '../actions/token.actions';
import {SelectedTokenActions} from '../actions/selected-token.actions';
import {DragDataTransfer} from '../../shared/models/drag-data-transfer';
import {Untold} from '../../shared/models/backend-export';
import {RealmHubSenderService} from '../../shared/services/realm-hub-sender.service';

@Injectable()
export class TokenService {
  tokens: Observable<Array<Token>>;
  selectedToken: Observable<Token>;

  private current: Array<Token>;
  private currentSelected: Token;

  constructor(private store: Store<AppStore>,
              private realmHubSenderService: RealmHubSenderService,
              private gameService: GameService ) {
    this.tokens = store.select(s => s.Tokens);
    this.selectedToken = store.select(s => s.SelectedToken);

    this.tokens.subscribe(ts => {
      this.current = ts;
    });

    this.selectedToken.subscribe(t => {
      this.currentSelected = t;
    });
  }

  createToken(image: Untold.ClientImage, x: number, y: number, width: number, height: number, layerId: number) {
    const game = this.gameService.getCurrent();

    const data = this.tokenToJson({
      column: 1,
      row: 1,
      fitToGrid: true,
      beingDragged: false,
      id : 0,
      x: x,
      y: y,
      height: width,
      width: height,
      layer: layerId,
      image: image,
      loadedImage: null,
      owner: null
    });

    this.realmHubSenderService.createToken({
      id: 0,
      data: data,
      mapId: game.localMembership.activeMap.id,
      realmId: game.realm.id
    });
  }

  addToLocalStore(clientTokens: Array<Untold.ClientToken>) {
    const tokens: Array<Token> = [];

    clientTokens.forEach(clientToken => {
      const token: Token = JSON.parse(clientToken.data);

      if (token.id === 0) {
        token.id = clientToken.id;
      }

      tokens.push(token);
    });

    this.store.dispatch({ type: TokenActions.ADD_TOKENS, payload: tokens });
  }

  resetTokens() {
    this.store.dispatch({ type: TokenActions.ADD_TOKENS, payload: [] });
    // this.selectTokenById(null);
  }

  updateToken(token: Token, syncOnline: boolean) {
    this.store.dispatch({ type: TokenActions.UPDATE_TOKEN, payload: token });

    const selectedToken = this.getCurrentSelectedToken();

    if (selectedToken && selectedToken.id === token.id) {
      this.selectTokenById(token.id);
    }

    const game = this.gameService.getCurrent();

    if (syncOnline) {
      this.realmHubSenderService.updateToken({
        id: token.id,
        data: this.tokenToJson(token),
        realmId: game.realm.id,
        mapId: game.localMembership.activeMap.id
      });
    }
  }

  selectTokenById(id: number) {
    const token = id ? this.getTokenById(id) : null;
    this.store.dispatch({ type: SelectedTokenActions.SET_SELECTED_TOKEN, payload: token ? token : {} });
  }

  getTokenById(id: number): Token {
   const matchingToken = this.getCurrent().filter(token => {
      return token.id === id;
    })[0];

    return matchingToken;
  }

  getCurrent(): Array<Token> {
    return this.current;
  }

  getCurrentSelectedToken(): Token {
   return  this.currentSelected;
  }

  private tokenToJson(token: Token): string {
    const prepared = JSON.parse(JSON.stringify(token));

    delete(prepared.beingDragged);
    delete(prepared.loadCompleted);
    delete(prepared.loadedImage);
    delete(prepared.loadInProgress);

    return JSON.stringify(prepared);
  }
}
