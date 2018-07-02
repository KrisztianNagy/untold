import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs';

import {AppStore} from '../app-store';
import {VisibleAreaActions} from '../actions/visible-area.actions';
import {VisibleArea} from '../models/visible-area';

@Injectable()
export class VisibleAreaService {
  visibleArea: Observable<VisibleArea>;

  private current: VisibleArea;

  constructor(private store: Store<AppStore>) {
    this.visibleArea = this.store.select(s => s.VisibleArea);

    this.visibleArea.subscribe(va => {
      this.current = va;
    });
  }

  updateVisibleArea(visibleArea: VisibleArea) {
    this.store.dispatch({ type: VisibleAreaActions.SET_VISIBLEAREA, payload: visibleArea });
  }

  getCurrent(): VisibleArea {
    return this.current;
  }
}
