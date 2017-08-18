import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';

import { SelectItem } from 'primeng/primeng';
import { Inplace } from 'primeng/primeng';

import { Untold } from '../../shared/models/backend-export';
import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { EntityService } from '../../store/services/entity.service';
import { GameWorkflowEntityService } from '../../shared/services/game-flow/game-workflow-entity.service';

@Component({
  selector: 'app-genesis-entities',
  templateUrl: './genesis-entities.component.html',
  styleUrls: ['./genesis-entities.component.css']
})
export class GenesisEntitiesComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  entities: Untold.ClientEntity[];
  private definitionSubscription;

  constructor(private realmDefinitionService: RealmDefinitionService,
              private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService,
              private gameWorkflowEntityService: GameWorkflowEntityService) {

  }

  ngOnInit() {
    this.entities = [];

    this.definitionSubscription = this.realmDefinitionService.definitions.subscribe(realmDefinitions => {
      this.modules = realmDefinitions.map(rd => {
         return {
          label: rd.name,
          value: rd
        };
      });

      if (this.selectedModule) {
        const matching = realmDefinitions.filter(rt => rt.id === this.selectedModule.id);
        this.selectedModule = matching.length ? matching[0] : null;
        this.populateEntities();
      }

      if (!this.selectedModule && this.modules.length ) {
        this.selectedModule = this.modules[0].value;
        this.populateEntities();
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.definitionSubscription.unsubscribe();
  }

  moduleChanged() {
    this.populateEntities();
  }

  updateEntityName(entity: Untold.ClientEntity) {
        this.entityService.updateEntity(entity);
        this.gameWorkflowEntityService.saveEntity(entity);
  }

  deleteEntity(entity: Untold.ClientEntity) {
    this.gameWorkflowEntityService.deleteEntity(entity);
    this.populateEntities();
  }

  private populateEntities() {
    this.entities = this.entityService.getCurrent().filter(ent => ent.moduleGuid = this.selectedModule.guid);
    this.changeDetectorRef.markForCheck();
  }

  selectEntity() {

  }

}
