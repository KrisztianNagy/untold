import { Injectable } from '@angular/core';
import { merge, first } from 'rxjs/operators';

import {RenderService} from '../services/render.service';
import {GridRenderService} from '../services/grid-render.service';
import {GridService} from '../../../store/services/grid.service';
import {WallService} from '../../../store/services/wall.service';
import {VisibleAreaService} from '../../../store/services/visible-area.service';
import {InteractionService} from '../../../store/services/interaction.service';
import {GridTile} from '../../../store/models/grid-tile';
import {Wall} from '../../../store/models/wall';
import {LayerPositionConstants} from '../../../shared/constants/layer-position-constants';
import {SelectionModeConstants} from '../../../shared/constants/selection-mode-constants';

@Injectable()
export class WallRenderService {
  layer: createjs.Container;

  private mergedSubscription;
  private gridTileSubscription;
  constructor(private renderService: RenderService,
              private gridRenderService: GridRenderService,
              private gridService: GridService,
              private wallService: WallService,
              private visibleAreaService: VisibleAreaService,
              private interactionService: InteractionService) {

  }

  init(layer: createjs.Container) {
    this.layer = layer;
    this.addCreateLineHandler();

    this.gridTileSubscription = this.gridService.gridTiles.subscribe(tiles => {
        this.updateWalls(tiles);
    });

    this.mergedSubscription = this.interactionService.interaction
      .pipe(merge(this.wallService.calculatedWalls),
      merge(this.wallService.userWalls))
      .subscribe(() => {
       this.draw();
    });
  }

  destroy() {
    this.gridTileSubscription.unsubscribe();
    this.mergedSubscription.unsubscribe();
  }

  updateWalls(gridTiles: GridTile[]) {
    let walls: Wall[] = [];

    const filteredGridTiles = gridTiles.filter(tile => {
      return tile.isBlock;
    });

    filteredGridTiles.forEach(tile => {
      const corners = this.gridRenderService.getGridCornerPositions(tile.row, tile.column);

      walls = this.optimizedAddWall(walls, this.getWallFromPoints(corners[0], corners[1]));
      walls = this.optimizedAddWall(walls, this.getWallFromPoints(corners[1], corners[2]));
      walls = this.optimizedAddWall(walls, this.getWallFromPoints(corners[2], corners[3]));
      walls = this.optimizedAddWall(walls, this.getWallFromPoints(corners[3], corners[0]));
    });

    walls = this.mergeWalls(walls);
    this.wallService.setCalculatedWalls(walls);
  }

  private getWallFromPoints (from: createjs.Point, to: createjs.Point): Wall {
    return {
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      id: 0
    };
  }

  private optimizedAddWall(walls: Wall[], nextWall: Wall): Wall[] {
    const optimizedWall: Wall[] = [];
    let found = false;

    walls.forEach(wall => {
      if (wall.fromX === nextWall.toX &&
          wall.fromY === nextWall.toY &&
          wall.toX === nextWall.fromX &&
          wall.toY === nextWall.fromY) {
          found = true;
      } else {
        optimizedWall.push(wall);
      }
    });

    if (!found) {
      optimizedWall.push(nextWall);
    }

    return optimizedWall;
  }

   private mergeWalls(walls: Wall[]): Wall[] {
     let mergedWalls: Wall[] = [];

     walls.forEach(wall => {
       const extendingWall = mergedWalls.find(otherWall => {
          return((otherWall.fromX  === wall.toX && otherWall.fromY === wall.toY) &&
                 (otherWall.toX === wall.fromX || otherWall.toY === wall.fromY)) ||
                ((otherWall.toX  === wall.fromX && otherWall.toY === wall.fromY) &&
                 (otherWall.fromX === wall.toX || otherWall.fromY === wall.toY));
       });

       if (extendingWall) {
        mergedWalls = mergedWalls.filter(otherWall => otherWall !== extendingWall);

        const extendAfter: boolean = extendingWall.fromX  === wall.toX && extendingWall.fromY === wall.toY;
        const before = extendAfter ? wall : extendingWall;
        const after = extendAfter ? extendingWall : wall;

        mergedWalls.push({
          fromX: before.fromX,
          fromY: before.fromY,
          toX: after.toX,
          toY: after.toY,
          id: 0
        });
       } else {
         mergedWalls.push(wall);
       }
     });

     return mergedWalls;
  }

  private draw() {
    const interaction = this.interactionService.getCurrent();

    if (this.layer.numChildren > 0) {
      this.layer.removeAllChildren();
    }

    if (interaction.layerId !== LayerPositionConstants.Wall) {
      this.renderService.update();
      return;
    }

    const calculatedWalls = this.wallService.getCurrentCalculatedWalls();
    const userWalls = this.wallService.getCurrentUserWalls();

    calculatedWalls.forEach((wall: Wall, index: number) => {
      const line = new createjs.Shape();
      line.name = 'CALCULATEDWALL' + index;
      line.graphics
        .setStrokeStyle(4)
        .beginStroke('Red')
        .moveTo(wall.fromX, wall.fromY)
        .lineTo(wall.toX, wall.toY)
        .endStroke();

      this.layer.addChild(line);
    });

    userWalls.forEach((wall: Wall) => {
      const line = new createjs.Shape();
      line.name = 'USERWALL' + wall.id;
      line.graphics
        .setStrokeStyle(4)
        .beginStroke('Green')
        .moveTo(wall.fromX, wall.fromY)
        .lineTo(wall.toX, wall.toY)
        .endStroke();

      line.addEventListener('click', (event: createjs.Event) => {
         const index = parseInt(event.target.name.split('USERWALL')[1], 10);
         this.wallService.deleteUserWallById(index);
      });

      this.layer.addChild(line);
    });

    this.renderService.update();
  }

  private addCreateLineHandler()  {
    this.renderService.stageMouseDown.forEach(e  => {
      const interaction = this.interactionService.getCurrent();

      if (interaction.cursor !== SelectionModeConstants.Select || interaction.layerId !== LayerPositionConstants.Wall) {
        return;
      }

      this.renderService.stageMouseUp.pipe(first()).forEach(ev => {
        if (e.localX !== ev.localX || e.localY !== ev.localY) {
          this.wallService.addUserWall({
            fromX: e.localX,
            fromY: e.localY,
            toX: ev.localX,
            toY: ev.localY,
            id: -1
          });
        }
      });
    });
  }
}
