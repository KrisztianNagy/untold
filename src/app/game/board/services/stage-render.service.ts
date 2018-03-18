import { Injectable } from '@angular/core';

import {RenderService} from '../services/render.service';
import {GridService} from '../../../store/services/grid.service';
import {VisibleAreaService} from '../../../store/services/visible-area.service';
import {InteractionService} from '../../../store/services/interaction.service';
import {SelectionModeConstants} from '../../../shared/constants/selection-mode-constants';
import {MapConstants} from '../../../shared/constants/map-constants';

@Injectable()
export class StageRenderService {
  width: number;
  height: number;
  scale: number;

  constructor(private renderService: RenderService,
              private gridService: GridService,
              private visibleAreaService: VisibleAreaService,
              private interactionService: InteractionService) {
  }

  init() {
    this.updateCanvasDimensions();
    this.addMoveHandler();
    this.updateVisibleArea();
  }

  addMoveHandler() {
    this.renderService.stageMouseDown.forEach(e  => {
      if (this.interactionService.getCurrent().cursor !== SelectionModeConstants.Free) {
        return;
      }

      const offset = {
        x: this.renderService.stage.x - e.stageX,
        y: this.renderService.stage.y - e.stageY
      };

      this.renderService.stageMouseMove.takeUntil(this.renderService.stageMouseUp).forEach(ev => {
          this.renderService.stage.x = ev.stageX + offset.x;
          this.renderService.stage.y = ev.stageY + offset.y;

          if (this.renderService.stage.x > 0) {
            this.renderService.stage.x = 0;
          }

          if (this.renderService.stage.y > 0) {
            this.renderService.stage.y = 0;
          }

          this.renderService.stage.update();
          this.updateVisibleArea();
      });
    });
  }

  zoom(scaleChange: number) {
    const visibleArea = this.visibleAreaService.getCurrent();

    if (visibleArea.zoom + scaleChange > 0) {
      const minimumScale = this.width / (MapConstants.GridSize * MapConstants.MapSize);
      visibleArea.zoom = visibleArea.zoom  + scaleChange > minimumScale ?  visibleArea.zoom  + scaleChange : minimumScale;
    }

    this.renderService.stage.scaleX = visibleArea.zoom ;
    this.renderService.stage.scaleY = visibleArea.zoom ;
    this.renderService.stage.update();
    this.updateVisibleArea();
  }

  updateVisibleArea() {
    const fromX = -this.renderService.stage.x / this.renderService.stage.scaleX;
    const toX = fromX + this.width / this.renderService.stage.scaleX;
    const fromY = -this.renderService.stage.y / this.renderService.stage.scaleY;
    const toY = fromY + this.height / this.renderService.stage.scaleY;

    this.visibleAreaService.updateVisibleArea({
      fromX : fromX,
      toX : toX,
      fromY : fromY,
      toY : toY,
      zoom: this.renderService.stage.scaleY
    });
  }

  public updateCanvasDimensions() {
    const canvas = document.getElementById('demoCanvas');
    const elemRect = canvas.getBoundingClientRect();

    this.width = elemRect.right - elemRect.left;
    this.height = elemRect.bottom - elemRect.top;

    this.updateVisibleArea();
  }
}
