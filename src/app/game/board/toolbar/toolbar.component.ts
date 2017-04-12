import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {Store} from '@ngrx/store';

import {AppStore} from '../../../store/app-store';
import {InteractionService} from '../../../store/services/interaction.service';
import {StageRenderService} from '../services/stage-render.service';
import {TokenService} from '../../../store/services/token.service';
import {Interaction} from '../../../store/models/interaction';
import {Token} from '../../../store/models/token';
import {GameService} from '../../../store/services/game.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit, OnDestroy {
  layers: Array<any>;
  interaction: Interaction;
  selectedType: string;
  selectedLayer: number;
  selectedToken: Token;
  visibleDialog: string;

  private interactionSubscription;
  private selectedTokenSubscription;
  private game;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private store: Store<AppStore>,
              private interactionService: InteractionService,
              private gameService: GameService,
              private tokenService: TokenService,
              private stageRenderService: StageRenderService) {

    this.game = this.gameService.getCurrent();

    if (this.game.realm.isCurrentUserOwner) {
      this.layers = [
          { label: 'Background', value: 0 } ,
          { label: 'Grid', value: 1 },
          { label: 'Wall', value: 2 },
          { label: 'Hidden', value: 3 },
          { label: 'Foreground', value: 4 }
        ];

    } else {
      this.layers = [ { label: 'Foreground', value: 4 } ];
    }

    this.selectedLayer = this.layers[0];
  }

  ngOnInit() {
    this.interactionSubscription = this.interactionService.interaction.subscribe(inter => {
      this.interaction = inter;
      this.selectedType = this.interaction.cursor;

      if (this.gameService.getCurrent().realm.isCurrentUserOwner) {
        this.selectedLayer = this.interaction.layerId;
      }

      this.changeDetectorRef.markForCheck();
    });

    this.selectedTokenSubscription = this.tokenService.selectedToken.subscribe(token => {
      this.selectedToken = token;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.interactionSubscription.unsubscribe();
    this.selectedTokenSubscription.unsubscribe();
  }

  changeInteraction(layerId: number, cursor: string) {
    if (!this.interaction) {
      return;
    }

    if (!layerId) {
      layerId = this.interaction.layerId;
    }

    if (!cursor) {
      cursor = this.interaction.cursor;
    }

    this.interactionService.update({
      cursor: cursor,
      layerId: layerId,
      isTokenEditorOpen: this.interaction.isTokenEditorOpen
    });
  }

  layerChanged() {
    this.changeInteraction(this.selectedLayer, null);
  }

  onCloseDialog(resetInteraction: boolean) {
    this.visibleDialog = '';
    if (resetInteraction) {
      this.interaction.isTokenEditorOpen = false;
      this.changeInteraction(null, null);
    }
  }

  openDialog(dialogName) {
    this.visibleDialog = dialogName;

    this.interaction.isTokenEditorOpen = dialogName === 'edit-token';
    this.changeInteraction(null, null);
  }

  zoom(scaleChange: number) {
    this.stageRenderService.zoom(scaleChange);
  }
}
