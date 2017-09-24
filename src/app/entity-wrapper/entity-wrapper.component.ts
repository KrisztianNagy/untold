import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityEnhancerService } from '../shared/services/expressions/entity-enhancer.service';
import { GenesisEntity, GenesisTreeNode } from '../shared/models/genesis-entity';
import { EntityService } from '../store/services/entity.service';
import { SheetService } from '../store/services/sheet.service';
import { GameWorkflowEntityService } from '../shared/services/game-flow/game-workflow-entity.service';
import { SheetEntityService } from '../shared/services/expressions/sheet-entity.service';
import { Sheet } from '../store/models/sheet';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityWrapperComponent implements OnInit, OnDestroy {
  id: number;
  hasSheet: boolean;
  entity: GenesisEntity;
  model: any;
  sheet: Sheet;
  private entitySub: any;
  private routeSub: any;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
              private sheetEntityService: SheetEntityService,
              private sheetService: SheetService,
              private route: ActivatedRoute,
              private router: Router) {

  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = parseInt(params['id'], 10);

        this.entitySub = this.entityService.entities
          .subscribe(entities =>
            entities.filter(ent => ent.id === this.id)
              .forEach(ent => {
                this.entityEnhancerService.getGenesisEntity(ent).subscribe(gen => {
                  this.entity = gen;

                  if (ent.sheetId) {
                    this.hasSheet = true;
                    let simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
                    this.model = JSON.parse(JSON.stringify(simple));

                    this.sheetService.getCurrent().filter(sh => sh.id === ent.sheetId)
                      .forEach(sheet => {
                        this.sheet = sheet;
                      });
                  } else {
                    this.hasSheet = false;
                  }

                  this.changeDetectorRef.markForCheck();
                });
            }));
      }
    });
  }

  ngOnDestroy() {
    this.entitySub.unsubscribe();
    this.routeSub.unsubscribe();
  }

  updateEntity(event: GenesisEntity) {
    this.entityService.getCurrent()
      .filter(ent => ent.id === this.id)
      .forEach(ent => {
        ent.entity = event.entity;

        this.entityEnhancerService.recalculate(ent).subscribe(calculated => {
          this.gameWorkflowEntityService.saveEntityValue(calculated);
      });
    });
  }

  onBuildCompleted(event: boolean) {

  }

  entityChanged(event: any) {
    const genesisEntity = JSON.parse(JSON.stringify(this.entity));
    genesisEntity.entity  = this.sheetEntityService.getEntityFromSimpleEntity(this.entity, event);
    this.updateEntity(genesisEntity);
  }
}
