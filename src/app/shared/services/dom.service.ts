import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class DomService {
  refreshCanvasSubject: Subject<any>;

  constructor() {
    this.refreshCanvasSubject = new Subject<any>();
  }

  recalculateCanvas() {
    setTimeout(() => {
      let widthOffset = 50;
      const heightOffset = 160;
      if (!$('#menu-button').hasClass('menu-button-rotate')) {
        widthOffset += 250;
      }
      const width = window.innerWidth - widthOffset;
      const height = window.innerHeight - heightOffset;

      const canvas = <any> $('#demoCanvas')[0];

      if (canvas) {
        canvas.width = width;
        canvas.height = height;

        this.refreshCanvasSubject.next(true);
      }
    }, 1000);
  }

}
