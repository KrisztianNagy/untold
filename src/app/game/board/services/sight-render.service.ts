import { Injectable } from '@angular/core';
import { merge } from 'rxjs/operators';

import { RenderService } from '../services/render.service';
import { WallService } from '../../../store/services/wall.service';
import { VisibleAreaService } from '../../../store/services/visible-area.service';
import { InteractionService } from '../../../store/services/interaction.service';
import { TokenService } from '../../../store/services/token.service';
import { Wall } from '../../../store/models/wall';
import { VisibleArea } from '../../../store/models/visible-area';
import { VisibilityService } from '../../../shared/services/visibility.service';
import { MapConstants } from '../../../shared/constants/map-constants';
import { LayerPositionConstants } from '../../../shared/constants/layer-position-constants';

@Injectable()
export class SightRenderService {
  layer: createjs.Container;

  private mergedSubscription;
  constructor(private renderService: RenderService,
    private wallService: WallService,
    private visibleAreaService: VisibleAreaService,
    private interactionService: InteractionService,
    private tokenService: TokenService,
    private visibilityService: VisibilityService) {
  }

  init(layer: createjs.Container) {
    this.layer = layer;

    this.mergedSubscription = this.interactionService.interaction
      .pipe(
        merge(this.tokenService.selectedToken),
        merge(this.wallService.calculatedWalls),
        merge(this.wallService.userWalls),
        merge(this.visibleAreaService.visibleArea))
      .subscribe(() => {
        this.draw();
      });
  }

  destroy() {
    this.mergedSubscription.unsubscribe();
  }

  private draw() {
    const interaction = this.interactionService.getCurrent();
    const token = this.tokenService.getCurrentSelectedToken();

    if (interaction.layerId !== LayerPositionConstants.Foreground || !token.id) {
      if (this.layer.numChildren > 0) {
        const innervisibleArea = this.visibleAreaService.getCurrent();

        this.layer.removeAllChildren();
        this.layer.cache(innervisibleArea.fromX, innervisibleArea.fromY, innervisibleArea.toX, innervisibleArea.toY);
        this.renderService.update();
      }
      return;
    }

    const walls = [...this.wallService.getCurrentCalculatedWalls(), ...this.wallService.getCurrentUserWalls()];
    const visibleArea = this.visibleAreaService.getCurrent();

    this.getMapWalls().forEach(wall => {
      walls.push(wall);
    });

    const lightSource = new createjs.Point(token.x, token.y);
    const triangles = this.visibilityService.getVisibleTriangles(lightSource, walls);

    this.layer.removeAllChildren();

    const blackBox = new createjs.Shape();
    blackBox.graphics.beginFill('Black');
    blackBox.graphics.drawRect(visibleArea.fromX, visibleArea.fromY, visibleArea.toX, visibleArea.toY);
    this.layer.addChild(blackBox);
    this.layer.cache(visibleArea.fromX, visibleArea.fromY, visibleArea.toX, visibleArea.toY);
    this.layer.removeChild(blackBox);

    const shape = new createjs.Shape();
    const graphics = shape.graphics.s('Green').ss(3).mt(lightSource.x, lightSource.y);
    triangles.forEach(trianglePoints => {
      graphics
        .beginFill('Green')
        .lt(trianglePoints[0].x, trianglePoints[0].y)
        .lt(trianglePoints[1].x, trianglePoints[1].y)
        .lt(lightSource.x, lightSource.y)
        .cp();
    });

    this.layer.addChild(shape);
    this.layer.updateCache('destination-out');

    this.renderService.update();
  }

  private getVisibleAreaWalls(visibleArea: VisibleArea): Wall[] {
    return [
      {
        fromX: visibleArea.fromX,
        fromY: visibleArea.fromY,
        toX: visibleArea.toX,
        toY: visibleArea.fromY,
        id: 0,
      },
      {
        fromX: visibleArea.toX,
        fromY: visibleArea.fromY,
        toX: visibleArea.toX,
        toY: visibleArea.toY,
        id: 0,
      },
      {
        fromX: visibleArea.toX,
        fromY: visibleArea.toY,
        toX: visibleArea.fromX,
        toY: visibleArea.toY,
        id: 0,
      },
      {
        fromX: visibleArea.fromX,
        fromY: visibleArea.toY,
        toX: visibleArea.fromX,
        toY: visibleArea.fromY,
        id: 0,
      }
    ];
  }

  private getMapWalls(): Wall[] {
    const size = MapConstants.GridSize * MapConstants.MapSize;

    return [
      {
        fromX: 0,
        fromY: 0,
        toX: size,
        toY: 0,
        id: 0,
      },
      {
        fromX: size,
        fromY: 0,
        toX: size,
        toY: size,
        id: 0,
      },
      {
        fromX: size,
        fromY: size,
        toX: 0,
        toY: size,
        id: 0,
      },
      {
        fromX: 0,
        fromY: size,
        toX: 0,
        toY: 0,
        id: 0,
      }
    ];
  }
}
