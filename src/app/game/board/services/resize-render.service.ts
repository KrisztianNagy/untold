import { Injectable } from '@angular/core';

import {RenderService} from '../services/render.service';
import {TokenService} from '../../../store/services/token.service';
import {TokenRenderService} from './token-render.service';
import {InteractionService} from '../../../store/services/interaction.service';
import {Token} from '../../../store/models/token';
import {AreaBox} from '../../../shared/models/area-box';
import {Interaction} from '../../../store/models/interaction';
import {SelectionModeConstants} from '../../../shared/constants/selection-mode-constants';
import {MapConstants} from '../../../shared/constants/map-constants';

@Injectable()
export class ResizeRenderService {
  private subscription;
  private layer: createjs.Container;
  private resizeBox: AreaBox;

  constructor(private renderService: RenderService,
              private tokenRenderService: TokenRenderService,
              private tokenService: TokenService,
              private interactionService: InteractionService) {
     this.renderService.tokenResizerPressMoveSubject.subscribe((event: createjs.MouseEvent) => this.resizerPressMove(event) );
     this.renderService.tokenResizerPressUpSubject.subscribe((event: createjs.MouseEvent) => this.resizerPressUp(event) );
  }

  init(layer: createjs.Container) {
    this.layer = layer;
    this.subscription = this.interactionService.interaction.
    merge(this.tokenService.selectedToken).
      subscribe(() => {
        this.resizeBox = null;
        const selectedToken = this.tokenService.getCurrentSelectedToken();
        const interaction = this.interactionService.getCurrent();
        this.draw( selectedToken, interaction);
    });
  }

   destroy() {
    this.subscription.unsubscribe();
  }

  private draw(selectedToken: Token, interaction: Interaction) {
     this.layer.removeAllChildren();

     if (interaction.cursor === SelectionModeConstants.Select &&
        interaction.isTokenEditorOpen &&
        selectedToken &&
        selectedToken.id) {

        let addMoveListener: Boolean = false;

        if (!this.resizeBox) {
          addMoveListener = true;
          this.resizeBox = {
            fromX: selectedToken.x - selectedToken.height / 2,
            fromY: selectedToken.y - selectedToken.width / 2,
            toX: selectedToken.x + selectedToken.height / 2,
            toY: selectedToken.y + selectedToken.width / 2
          };
        }

        let left = new createjs.Shape();
        left.name = 'left';
        left.graphics
          .beginStroke('Red')
          .setStrokeStyle(3)
          .moveTo(this.resizeBox.fromX, this.resizeBox.fromY)
          .lineTo(this.resizeBox.fromX, this.resizeBox.toY)
          .cp();

        let right = new createjs.Shape();
        right.name = 'right';
        right.graphics
          .beginStroke('Red')
          .setStrokeStyle(3)
          .moveTo(this.resizeBox.toX, this.resizeBox.fromY)
          .lineTo(this.resizeBox.toX, this.resizeBox.toY)
          .cp();

        let top = new createjs.Shape();
        top.name = 'top';
        top.graphics
          .beginStroke('Red')
          .setStrokeStyle(3)
          .moveTo(this.resizeBox.fromX, this.resizeBox.fromY)
          .lineTo(this.resizeBox.toX, this.resizeBox.fromY)
          .cp();

        let bottom = new createjs.Shape();
        bottom.name = 'bottom';
        bottom.graphics
          .beginStroke('Red')
          .setStrokeStyle(3)
          .moveTo(this.resizeBox.fromX, this.resizeBox.toY)
          .lineTo(this.resizeBox.toX, this.resizeBox.toY)
          .cp();

        top.addEventListener('pressmove', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressMoveSubject.next(evt) ;
        });

        top.addEventListener('pressup', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressUpSubject.next(evt);
        });

        bottom.addEventListener('pressmove', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressMoveSubject.next(evt) ;
        });

        bottom.addEventListener('pressup', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressUpSubject.next(evt) ;
        });

        left.addEventListener('pressmove', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressMoveSubject.next(evt);
        });

        left.addEventListener('pressup', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressUpSubject.next(evt) ;
        });

        right.addEventListener('pressmove', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressMoveSubject.next(evt);
        });

        right.addEventListener('pressup', (evt: createjs.MouseEvent) => {
          this.renderService.tokenResizerPressUpSubject.next(evt) ;
        });

        this.layer.addChild(top);
        this.layer.addChild(bottom);
        this.layer.addChild(left);
        this.layer.addChild(right);
      }

      this.renderService.update();
  }

  private resizerPressMove(event: createjs.MouseEvent) {
    const name = <string> event.target.name;
    let line = this.layer.getChildByName(name);
    const local = this.layer.globalToLocal(event.stageX, event.stageY);

    if (name === 'left') {
      let dist = this.resizeBox.fromX - local.x;
      if (dist < 0  && this.resizeBox.toX - this.resizeBox.fromX <= MapConstants.GridSize) {
        dist = 0;
      }

      this.resizeBox.fromX = this.resizeBox.fromX - dist;
      this.resizeBox.fromY = this.resizeBox.fromY - dist;
      this.resizeBox.toX = this.resizeBox.toX + dist;
      this.resizeBox.toY = this.resizeBox.toY + dist;
    }

    if (name === 'right') {
      let dist = local.x - this.resizeBox.toX;
      if (dist < 0  && this.resizeBox.toX - this.resizeBox.fromX <= MapConstants.GridSize) {
        dist = 0;
      }

      this.resizeBox.fromX = this.resizeBox.fromX - dist;
      this.resizeBox.fromY = this.resizeBox.fromY - dist;
      this.resizeBox.toX = this.resizeBox.toX + dist;
      this.resizeBox.toY = this.resizeBox.toY + dist;
    }

   if (name === 'top') {
      let dist = this.resizeBox.fromY - local.y;
      if (dist < 0  && this.resizeBox.toY - this.resizeBox.fromY <= MapConstants.GridSize) {
        dist = 0;
      }

      this.resizeBox.fromX = this.resizeBox.fromX - dist;
      this.resizeBox.fromY = this.resizeBox.fromY - dist;
      this.resizeBox.toX = this.resizeBox.toX + dist;
      this.resizeBox.toY = this.resizeBox.toY + dist;
    }

    if (name === 'bottom') {
      let dist = local.y - this.resizeBox.toY;
      if (dist < 0  && this.resizeBox.toY - this.resizeBox.fromY <= MapConstants.GridSize) {
        dist = 0;
      }

      this.resizeBox.fromX = this.resizeBox.fromX - dist;
      this.resizeBox.fromY = this.resizeBox.fromY - dist;
      this.resizeBox.toX = this.resizeBox.toX + dist;
      this.resizeBox.toY = this.resizeBox.toY + dist;
    }

    this.draw(this.tokenService.getCurrentSelectedToken(), this.interactionService.getCurrent());
  }

  private resizerPressUp(event: createjs.MouseEvent) {
    let token = this.tokenService.getCurrentSelectedToken();

    if (this.resizeBox.toX - this.resizeBox.fromX >= MapConstants.GridSize &&
        this.resizeBox.toY - this.resizeBox.fromY >= MapConstants.GridSize) {
      token.width = this.resizeBox.toX - this.resizeBox.fromX;
      token.height = this.resizeBox.toY - this.resizeBox.fromY;
    }

    token.loadedImage = null;
    this.tokenRenderService.updateToken(token);
  }
}
