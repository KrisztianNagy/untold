import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityEnhancerService } from '../shared/services/expressions/entity-enhancer.service';
import { GenesisEntity, GenesisTreeNode } from '../shared/models/genesis-entity';
import { EntityService } from '../store/services/entity.service';
import { GameWorkflowEntityService } from '../shared/services/game-flow/game-workflow-entity.service';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityWrapperComponent implements OnInit, OnDestroy {
  id: number;
  entity: GenesisEntity;
  private entitySub: any;
  private routeSub: any;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
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

  updateEntity(event) {
    this.entityService.getCurrent()
      .filter(ent => ent.id === this.id)
      .forEach(ent => {
        ent.entity = event.entity;

        this.entityEnhancerService.recalculate(ent).subscribe(calculated => {
          this.entityService.updateEntity(calculated);
          this.gameWorkflowEntityService.saveEntityValue(calculated);
      });
    });
  }
}
