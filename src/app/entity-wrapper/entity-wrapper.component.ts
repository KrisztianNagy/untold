import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EntityEnhancerService } from '../shared/services/expressions/entity-enhancer.service';
import { GenesisEntity, GenesisTreeNode } from '../shared/models/genesis-entity';
import { EntityService } from '../store/services/entity.service';

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

  constructor(private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private route: ActivatedRoute,
              private router: Router,) {

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
          ent.entity = calculated;
          this.entityService.updateEntity(ent);
      });
    });
  }
}