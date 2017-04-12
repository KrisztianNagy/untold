import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { EntityService } from '../../../store/services/entity.service';

@Component({
  selector: 'app-create-entity',
  templateUrl: './create-entity.component.html',
  styleUrls: ['./create-entity.component.css']
})
export class CreateEntityComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  selecteDefinition: Untold.ClientDefinition;
  private definitionSubscription;

  constructor(private realmDefinitionService: RealmDefinitionService,
              private changeDetectorRef: ChangeDetectorRef,
              private entityService: EntityService) { }

  ngOnInit() {
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
        this.selecteDefinition = this.selectedModule.definitions.length > 0 ? this.selectedModule.definitions[0] : null;
      }

      if (!this.selectedModule && this.modules.length ) {
        this.selectedModule = this.modules[0].value;
        this.selecteDefinition = this.selectedModule.definitions.length > 0 ? this.selectedModule.definitions[0] : null;
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.definitionSubscription.unsubscribe();
  }



}
