import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {Store} from '@ngrx/store';

import {AppStore} from '../../../store/app-store';
import {InteractionService} from '../../../store/services/interaction.service';
import {Interaction} from '../../../store/models/interaction';
import {InteractionActions} from '../../../store/actions/interaction.actions';
import {StageRenderService} from '../services/stage-render.service';
import {SimpleDungeonService} from '../../../shared/services/mapGenerators/simpleDungeon/simple-dungeon.service';
import {GridService} from '../../../store/services/grid.service';
import {GridTile} from '../../../store/models/grid-tile';

@Component({
  selector: 'app-layer-selector',
  templateUrl: './layer-selector.component.html',
  styleUrls: ['./layer-selector.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerSelectorComponent implements OnInit {
  cursor: string;
  layerId: string;
  light: boolean;

  constructor(private store: Store<AppStore>,
              private interactionService: InteractionService,
              private stageRenderService: StageRenderService,
              private simpleDungeonService: SimpleDungeonService,
              private gridService: GridService) {
    store.select(s => s.Interaction).
      subscribe(interaction => {
        this.cursor = interaction.cursor;
        this.layerId = interaction.layerId.toString();
      });
  }

  ngOnInit() {
  }

  update() {
   /* this.interactionService.update({
      cursor: this.cursor,
      layerId: parseInt(this.layerId),
      isTokenEditorOpen:
    }); */
  }

  zoom(scaleChange: number) {
    this.stageRenderService.zoom(scaleChange);
  }

  generate() {
    const map = this.simpleDungeonService.generate(100, 100);
    const tiles: Array<GridTile> = [];

    map.forEach((row, index) => {
      row.forEach((value, index2) => {
        tiles.push({
          row: index,
          column: index2,
          isBlock: value === 2
        });
      });
    });

    this.gridService.SetTiles(tiles);
  }
}
