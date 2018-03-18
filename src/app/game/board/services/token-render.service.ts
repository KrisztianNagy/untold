import { Injectable } from '@angular/core';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/first';

import {RenderService} from '../services/render.service';
import {GridRenderService} from '../services/grid-render.service';
import {GameService} from '../../../store/services/game.service';
import {TokenService} from '../../../store/services/token.service';
import {InteractionService} from '../../../store/services/interaction.service';
import {VisibleAreaService} from '../../../store/services/visible-area.service';
import {Token} from '../../../store/models/token';
import {VisibleArea} from '../../../store/models/visible-area';
import {Interaction} from '../../../store/models/interaction';
import {SelectionModeConstants} from '../../../shared/constants/selection-mode-constants';
import {DragConstants} from '../../../shared/constants/drag-constants';
import {DragDataTransfer} from '../../../shared/models/drag-data-transfer';
import {MapConstants} from '../../../shared/constants/map-constants';
import {LayerPositionConstants} from '../../../shared/constants/layer-position-constants';

@Injectable()
export class TokenRenderService {
  foregroundLayer: createjs.Container;
  backgroundLayer: createjs.Container;
  hiddenLayer: createjs.Container;

  private tokenSubscription;
  constructor(private renderService: RenderService,
              private gridRenderService: GridRenderService,
              private tokenService: TokenService,
              private visibleAreaService: VisibleAreaService,
              private interactionService: InteractionService,
              private gameService: GameService) {

     this.renderService.tokenClickSubject.subscribe((event: createjs.MouseEvent) => this.tokenClicked(event) );
     this.renderService.tokenPressMoveSubject.subscribe((event: createjs.MouseEvent) => this.tokenPressMove(event) );
     this.renderService.tokenPressUpSubject.subscribe((event: createjs.MouseEvent) => this.tokenPressUp(event) );
  }

   init(foregroundLayer: createjs.Container, backgroundLayer: createjs.Container, hiddenLayer: createjs.Container) {
    this.foregroundLayer = foregroundLayer;
    this.backgroundLayer = backgroundLayer;
    this.hiddenLayer = hiddenLayer;

    this.tokenSubscription = this.tokenService.tokens.
      merge(this.interactionService.interaction).
      subscribe(() => {
        const tokens = this.tokenService.getCurrent();
        const interaction = this.interactionService.getCurrent();
        this.draw(tokens, interaction);
    });

    this.renderService.dropSubject.subscribe(dropEvent => {
       const interaction = this.interactionService.getCurrent();

       this.drop(dropEvent, interaction);
    });
  }

  destroy() {
    this.tokenSubscription.unsubscribe();
  }

  private getLayerFromToken(token: Token): createjs.Container {
    return this.getLayerFromId(token.layer);
  }

  private getLayerFromId(id: number): createjs.Container {
    if (id === LayerPositionConstants.Background) {
      return this.backgroundLayer;
    } else if ( id === LayerPositionConstants.Hidden) {
      return this.hiddenLayer;
    } else if (id === LayerPositionConstants.Foreground) {
      return this.foregroundLayer;
    }

    return null;
  }

  private drop(event: DragEvent, interaction: Interaction) {
    const layer = this.getLayerFromId(interaction.layerId);

    if (!layer) {
      return;
    }

    const dataJson = event.dataTransfer.getData('text');
    const data: DragDataTransfer = JSON.parse(dataJson);

    if (data.type !== DragConstants.Token && data.type !== DragConstants.Image) {
      return;
    }

    const offset = this.renderService.getCanvasOffset();
    const localPos = layer.globalToLocal(event.clientX + offset.x, event.clientY + offset.y);
    const token = this.tokenService.createToken(data.image, localPos.x, localPos.y, data.width, data.height, interaction.layerId);
  }

  private draw(tokens: Array<Token>, interaction: Interaction) {
    const game = this.gameService.getCurrent();

    [this.backgroundLayer, this.hiddenLayer, this.foregroundLayer].forEach(layer => {
      if (layer.numChildren > 0) {
        layer.removeAllChildren();
      }

      tokens.
        filter(token => {
          return token.loadedImage && layer === this.getLayerFromToken(token);
        }).
        forEach(token => {
          const name = token.id.toString();

          const bitmap = new createjs.Bitmap(token.loadedImage);
          bitmap.name = name;
          bitmap.x = token.x - token.width / 2;
          bitmap.y = token.y - token.height / 2;
          bitmap.scaleX = token.width / bitmap.image.width;
          bitmap.scaleY = token.height / bitmap.image.height;

          if (!interaction.isTokenEditorOpen &&
          (game.realm.isCurrentUserOwner || (token.owner && token.owner.id === game.localMembership.user.id))) {
            bitmap.addEventListener('click', (evt: createjs.Event) => {
                this.renderService.tokenClickSubject.next(evt);
            });

            bitmap.addEventListener('pressmove', (evt: createjs.MouseEvent) => {
                this.renderService.tokenPressMoveSubject.next(evt);
            });

            bitmap.addEventListener('pressup', (evt: createjs.MouseEvent) => {
                this.renderService.tokenPressUpSubject.next(evt);
            });
          }

          layer.addChild(bitmap);
        });
      });

      this.renderService.update();
  }

  private tokenClicked(event: createjs.Event) {
    const interaction = this.interactionService.getCurrent();
    const layer = this.getLayerFromId(interaction.layerId);

    if (interaction.cursor !== SelectionModeConstants.Select || !layer) {
      return;
    }

    const token = this.tokenService.getTokenById( parseInt(event.target.name, 10));
    const tokenLayer = this.getLayerFromToken(token);

    if (layer === tokenLayer) {
      this.tokenService.selectTokenById(parseInt(event.target.name, 10));
    }
  }

  private tokenPressMove(event: createjs.MouseEvent) {
    const interaction = this.interactionService.getCurrent();
    const layer = this.getLayerFromId(interaction.layerId);

    if (interaction.cursor !== SelectionModeConstants.Select || !layer) {
      return;
    }

    const name = <string> event.target.name;

    const shape = layer.getChildByName(name);
    const token = this.tokenService.getTokenById(parseInt(name, 10));
    const tokenLayer = this.getLayerFromToken(token);

    if (layer !== tokenLayer) {
      return;
    }

    const local = layer.globalToLocal(event.stageX, event.stageY);

    token.x = local.x;
    token.y = local.y;
    token.beingDragged = true;

    if (this.tokenService.getCurrentSelectedToken().id !== token.id) {
      this.tokenService.selectTokenById(token.id);
    }

    this.updateToken(token);
  }

  private tokenPressUp(event: createjs.MouseEvent) {
    const name = <string> event.target.name;
    const token = this.tokenService.getTokenById(parseInt(name, 10));
    token.beingDragged = false;

    this.updateToken(token);
  }

  public updateToken(token: Token) {
    const gridPosition = this.gridRenderService.getGridFromPosition(token.x, token.y);
    token.row = gridPosition.x;
    token.column = gridPosition.y;

    if (!token.beingDragged && token.fitToGrid) {
      const position = this.gridRenderService.getPositionFromGrid(token.row, token.column);
      token.x = position.x;
      token.y = position.y;
    }

    this.tokenService.updateToken(token, !token.beingDragged);
  }
}
