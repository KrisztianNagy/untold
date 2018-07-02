import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { RenderService } from './services/render.service';
import { StageRenderService } from './services/stage-render.service';
import { GridRenderService } from './services/grid-render.service';
import { WallRenderService } from './services/wall-render.service';
import { SightRenderService } from './services/sight-render.service';
import { ResizeRenderService } from './services/resize-render.service';
import { TokenRenderService } from './services/token-render.service';
import { InteractionService } from '../../store/services/interaction.service';
import { GridService } from '../../store/services/grid.service';
import { GameService } from '../../store/services/game.service';
import { VisibilityService } from '../../shared/services/visibility.service';
import { SimpleDungeonService } from '../../shared/services/mapGenerators/simpleDungeon/simple-dungeon.service';
import { AppStore } from '../../store/app-store';
import { LayerPositionConstants } from '../../shared/constants/layer-position-constants';
import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { DomService } from '../../shared/services/dom.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  providers: [
    RenderService,
    StageRenderService,
    GridRenderService,
    TokenRenderService,
    WallRenderService,
    SightRenderService,
    ResizeRenderService,
    VisibilityService,
    SimpleDungeonService]
})
export class BoardComponent implements OnInit, OnDestroy {
  private gridTilesSubscription;
  private refreshCanvasSubscription;

  constructor(private renderService: RenderService,
    private stageRenderService: StageRenderService,
    private gridRenderService: GridRenderService,
    private wallRenderService: WallRenderService,
    private sightRenderService: SightRenderService,
    private resizeRenderService: ResizeRenderService,
    private tokenRenderService: TokenRenderService,
    private interactionService: InteractionService,
    public gameService: GameService,
    private router: Router,
    private gridService: GridService,
    private realmHubSenderService: RealmHubSenderService,
    private domService: DomService,
    private store: Store<AppStore>) {

    this.interactionService.update({
      cursor: 'select',
      layerId: LayerPositionConstants.Foreground,
      isTokenEditorOpen: false
    });
  }

  ngOnInit() {
    this.renderService.init('demoCanvas');
    this.stageRenderService.init();
    this.gridRenderService.init(this.renderService.gridLayer);
    this.wallRenderService.init(this.renderService.wallLayer);
    this.resizeRenderService.init(this.renderService.resizeLayer);
    this.sightRenderService.init(this.renderService.sightLayer);
    this.tokenRenderService.init(this.renderService.foregroundLayer, this.renderService.backgroundLayer, this.renderService.hiddenLayer);

    this.addGridUploader();

    this.refreshCanvasSubscription = this.domService.refreshCanvasSubject.subscribe(() => {
      this.stageRenderService.updateCanvasDimensions();
      this.renderService.update();
    });

    setTimeout(() => {
      this.domService.recalculateCanvas();
      this.stageRenderService.updateCanvasDimensions();
    }, 1000);
  }

  ngOnDestroy() {
    this.removeGridUploader();
    this.refreshCanvasSubscription.unsubscribe();
    this.gridRenderService.destroy();
    this.sightRenderService.destroy();
    this.tokenRenderService.destroy();
    this.wallRenderService.destroy();
    this.resizeRenderService.destroy();
  }

  drop(event: DragEvent) {
    this.renderService.dropSubject.next(event);
  }

  allowDrop(event: Event) {
    event.preventDefault();
  }

  private addGridUploader() {
    const game = this.gameService.getCurrent();

    if (!game.realm.isCurrentUserOwner) {
      return;
    }

    this.gridTilesSubscription = this.gridService.gridTiles
      .pipe(debounceTime(5000))
      .subscribe(tiles => {
        const blocks = tiles.filter(tl => {
          return tl.isBlock === true;
        });
        const jsonData = JSON.stringify(blocks);

        this.realmHubSenderService.updateMapGrid({
          id: game.localMembership.activeMap.id,
          name: game.localMembership.activeMap.name,
          reamId: game.localMembership.activeMap.reamId,
          gridJson: jsonData
        });
      });
  }

  private removeGridUploader() {
    if (!this.gameService.getCurrent().realm.isCurrentUserOwner) {
      return;
    }

    this.gridTilesSubscription.unsubscribe();
  }
}
