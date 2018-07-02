import { Injectable } from '@angular/core';;
import { takeUntil } from 'rxjs/operators';

import {RenderService} from '../services/render.service';
import {GridService} from '../../../store/services/grid.service';
import {VisibleAreaService} from '../../../store/services/visible-area.service';
import {InteractionService} from '../../../store/services/interaction.service';
import {GridTile} from '../../../store/models/grid-tile';
import {MapConstants} from '../../../shared/constants/map-constants';
import {LayerPositionConstants} from '../../../shared/constants/layer-position-constants';
import {SelectionModeConstants} from '../../../shared/constants/selection-mode-constants';

@Injectable()
export class GridRenderService {
  layer: createjs.Container;
  basicLayer: createjs.Container;
  filledLayer: createjs.Container;

  private gridTilesSubscription;

  constructor(private renderService: RenderService,
              private gridService: GridService,
              private visibleAreaService: VisibleAreaService,
              private interactionService: InteractionService) {
  }

  init(layer: createjs.Container) {
    this.layer = layer;
    this.basicLayer = new createjs.Container();
    this.filledLayer = new createjs.Container();
    this.layer.addChild(this.basicLayer);
    this.layer.addChild(this.filledLayer);

    this.drawBasicLayer();
    this.addCreateLineHandler();

    this.gridTilesSubscription = this.gridService.gridTiles.
      subscribe((gridTiles) => {
        this.draw(gridTiles);
    });
  }

  destroy() {
    this.gridTilesSubscription.unsubscribe();
  }

  getGridFromPosition(x: number, y: number): createjs.Point {
    return new createjs.Point(Math.floor(x / MapConstants.GridSize), Math.floor(y / MapConstants.GridSize));
  }

  getPositionFromGrid(x: number, y: number): createjs.Point {
    return new createjs.Point(x * MapConstants.GridSize + MapConstants.GridSize / 2, y * MapConstants.GridSize + MapConstants.GridSize / 2);
  }

  getGridCornerPositions(x: number, y: number): createjs.Point[]  {
   return [
      new createjs.Point(x * MapConstants.GridSize, y * MapConstants.GridSize),
      new createjs.Point(x * MapConstants.GridSize + MapConstants.GridSize, y * MapConstants.GridSize),
      new createjs.Point(x * MapConstants.GridSize + MapConstants.GridSize, y * MapConstants.GridSize + MapConstants.GridSize),
      new createjs.Point(x * MapConstants.GridSize, y * MapConstants.GridSize + MapConstants.GridSize)
    ];
  }

  private drawBasicLayer() {
   for (let step = 0; step <= MapConstants.MapSize; step++ ) {
      const line1 = new createjs.Shape();
      line1.graphics.beginStroke('Black')
        .setStrokeStyle(1)
        .moveTo(step * MapConstants.GridSize, 0)
        .lineTo(step * MapConstants.GridSize, MapConstants.MapSize * MapConstants.GridSize)
        .cp();

      const line2 = new createjs.Shape();
      line2.graphics
        .beginStroke('Black')
        .setStrokeStyle(1)
        .moveTo(0, step * MapConstants.GridSize)
        .lineTo(MapConstants.MapSize * MapConstants.GridSize, step * MapConstants.GridSize)
        .cp();

      this.basicLayer.addChild(line1);
      this.basicLayer.addChild(line2);
    }

    this.basicLayer.cache(0, 0, MapConstants.MapSize * MapConstants.GridSize, MapConstants.MapSize * MapConstants.GridSize);
    this.basicLayer.snapToPixel = true;
  }

  private draw(gridTiles: GridTile[]) {

    const filteredGridTiles = gridTiles.filter(tile => {
      return tile.isBlock;
    });

    this.filledLayer.removeAllChildren();
    filteredGridTiles.forEach(gridTile => {
      const name = gridTile.row + '|' + gridTile.column;

      const tile = new createjs.Shape();
      tile.graphics
        .beginFill(gridTile.isBlock ? 'Blue' : 'White')
        .drawRect(gridTile.row * MapConstants.GridSize,
                  gridTile.column * MapConstants.GridSize,
                  MapConstants.GridSize - 1,
                  MapConstants.GridSize - 1);

      tile.name = name;

      this.filledLayer.addChild(tile);
    });
  }

  private update() {
    this.layer.setChildIndex(this.basicLayer, 0);
    this.layer.setChildIndex(this.filledLayer, 1);
    this.renderService.update();
  }

  private tileClicked(evt: createjs.MouseEvent) {
    if (this.interactionService.getCurrent().cursor !== SelectionModeConstants.Select ||
        this.interactionService.getCurrent().layerId !== LayerPositionConstants.Grid) {
      return;
    }

    const gridPos = this.getGridFromPosition(evt.localX, evt.localY);
    const gridTile = this.gridService.getByPosition(gridPos.x, gridPos.y);

    this.gridService.updateGridTile({
      row: gridTile.row,
      column: gridTile.column,
      isBlock: !gridTile.isBlock
    });
  }

  private addCreateLineHandler() {
    this.renderService.stageMouseDown.forEach(e  => {
      const interaction = this.interactionService.getCurrent();

      if (interaction.cursor !== SelectionModeConstants.Select ||
          interaction.layerId !== LayerPositionConstants.Grid) {
        return;
      }

      const firstGridPos = this.getGridFromPosition(e.localX, e.localY);
      const firstGridTile = this.gridService.getByPosition(firstGridPos.x, firstGridPos.y);
      let lastGridPos: createjs.Point = firstGridPos;
      let lastGridTile: GridTile = firstGridTile;

      this.gridService.updateGridTile({
        row: lastGridTile.row,
        column: lastGridTile.column,
        isBlock: !firstGridTile.isBlock
      });

      this.renderService.stageMouseMove
      .pipe(takeUntil(this.renderService.stageMouseUp)).forEach(ev => {
        lastGridPos = this.getGridFromPosition(ev.localX, ev.localY);
        lastGridTile = this.gridService.getByPosition(lastGridPos.x, lastGridPos.y);

        if (lastGridTile) {
          this.gridService.updateGridTile({
            row: lastGridTile.row,
            column: lastGridTile.column,
            isBlock: !firstGridTile.isBlock
          });
        }
      });
    });
  }
}
