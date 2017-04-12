import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/first';

import {TokenService} from '../../store/services/token.service';
import {Token} from '../../store/models/token';

@Injectable()
export class LoadQueueService {
  private currentLoadedImages: Array<any>;
  private inProgress: Array<string>;
  private queue: createjs.LoadQueue;
  private accessSignature: string;

  constructor(private tokenService: TokenService) {

  }

  reset(accessSignature: string) {
    this.accessSignature = accessSignature;
    this.destroy();

    this.currentLoadedImages = [];
    this.inProgress = [];
    this.queue = new createjs.LoadQueue(false, null, true);

    this.queue.on('fileload', (event: createjs.Event) => {
      this.currentLoadedImages.push({
        id: event.item.id,
        result: event.result
      });

      this.inProgress = this.inProgress.filter(url => {
        return url !== event.item.id;
      });

      const tokens = this.tokenService.getCurrent();
      const relatedTokens = tokens.filter(token => {
        return !token.loadedImage && this.getAppropriateUrl(token) === event.item.id;
      });

      relatedTokens.forEach(token => {
        this.completeToken(token, event.result);
      });
    });

    this.tokenService.tokens.
      subscribe(tokens => {
        this.loadImages(tokens);
    });
  }

  private destroy() {
    if (this.queue) {
      this.queue.close();
      this.queue = null;
    }

    this.currentLoadedImages = null;
    this.inProgress = null;
  }

  private loadImages(tokens: Array<Token>) {
    tokens.filter(token => {
      return !token.loadedImage;
    }).
    forEach(token => {
      this.loadItem(token);
    });
  }

  private completeToken(token: Token, result: any) {
    token.loadedImage = result;
    this.tokenService.updateToken(token, false);
  }

  private loadItem(token: Token) {
    const url = this.getAppropriateUrl(token);

    const processed = this.currentLoadedImages.filter(file => {
        return file.id === url;
      });

    if (processed.length > 0) {
      this.completeToken(token, processed[0].result);
    } else {

      const contains = this.inProgress.filter(prog => {
        return prog === url;
      }).length > 0;

      if (contains) {
      } else {
        const loadedItem = new createjs.LoadItem().set({
          src: url + this.accessSignature,
          crossOrigin: 'Anonymous',
          id: url,
          type: createjs.AbstractLoader.IMAGE
        });

        this.inProgress.push(url);
        this.queue.loadFile(loadedItem, true);
      }
    }
  }

  private getAppropriateUrl(token: Token): string {
    if (token.width <= 200 && token.height <= 200) {
      return token.image.fileSmallPath;
    }

    return token.image.filePath;
  }
}
