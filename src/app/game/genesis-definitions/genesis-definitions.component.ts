import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';

import { TreeNode } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { MenuItem } from 'primeng/primeng';

import { TreeNodeService } from '../../shared/services/tree-node.service';
import { GenesisDataService } from '../../shared/services/rest/genesis-data.service';
import { GameService } from '../../store/services/game.service';
import { RealmDefinitionService } from '../../store/services/realm-definition.service';
import { Untold } from '../../shared/models/backend-export';
import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { GameWorkflowEntityService } from '../../shared/services/game-flow/game-workflow-entity.service';
import { GameWorkflowSheetService } from '../../shared/services/game-flow/game-workflow-sheet.service';

@Component({
  selector: 'app-genesis-definitions',
  templateUrl: './genesis-definitions.component.html',
  styleUrls: ['./genesis-definitions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisDefinitionsComponent implements OnInit, OnDestroy {
  modules: Array<SelectItem>;
  moduleDefinitions: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  selectedDefinition: Untold.ClientDefinition;
  draftDefinition: Untold.ClientDefinition;
  createVisible: boolean;
  realmDefinitions:  Array<Untold.ClientModuleDefinitions>;
  saveItems: MenuItem[];
  definitionName: string;
  showAddDefinition: boolean;
  addDefinitionParent: Untold.ClientDefinition;
  private definitionSubscription;

  constructor(private treeNodeService: TreeNodeService,
              private changeDetectorRef: ChangeDetectorRef,
              private genesisDataService: GenesisDataService,
              private realmDefinitionService: RealmDefinitionService,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private gameWorkflowEntityService: GameWorkflowEntityService,
              private gameWorkflowSheetService: GameWorkflowSheetService) {

  }

  ngOnInit() {
    this.saveItems = [
      {label: 'Create Entity', icon: 'ui-icon-person-pin', command: () => {
        this.gameWorkflowEntityService.createEntity(this.selectedDefinition);
      }},
      {label: 'Create Sheet', icon: 'ui-icon-library-books', command: () => {
        this.gameWorkflowSheetService.createSheet(this.selectedDefinition);
      }},
      {label: 'Inherit', icon: 'ui-icon-cloud-download', command: () => {
        this.showDefinitionForm(this.selectedDefinition);
      }},
    ];

    this.definitionSubscription = this.realmDefinitionService.definitions.subscribe(realmDefinitions => {
      this.showAddDefinition = false;
      this.addDefinitionParent = null;
      this.definitionName = '';
      this.realmDefinitions = realmDefinitions;
      this.prepareDropdowns();
    });
  }

  ngOnDestroy() {
    if (this.definitionSubscription) {
      this.definitionSubscription.unsubscribe();
    }
  }

  prepareDropdowns() {
    this.modules = this.realmDefinitions.map(rd => {
      return {
       label: rd.name,
       value: rd
     };
   });

   if (this.selectedModule) {
     const matching = this.realmDefinitions.filter(rt => rt.id === this.selectedModule.id);
     this.selectedModule = matching.length ? matching[0] : null;
   }

   if (!this.selectedModule && this.modules.length ) {
     this.selectedModule = this.modules[0].value;
   }

   if (this.selectedModule) {
     this.moduleDefinitions = this.selectedModule.definitions
       .map(def => {
       return {
         label: def.name,
         value: def
       };
     });

     if (this.selectedDefinition) {
       const matching = this.selectedModule.definitions.filter(def => def.definitionGuid === this.selectedDefinition.definitionGuid);
       this.selectedDefinition = matching.length ? matching[0] : null;
     }

     if (!this.selectedDefinition && this.moduleDefinitions.length ) {
       this.selectedDefinition = this.moduleDefinitions[0].value;
     }
   } else {
     this.moduleDefinitions = [];
     this.selectedDefinition = null;
   }

   this.changeDetectorRef.markForCheck();
  }

  moduleChanged() {
    this.prepareDropdowns();
  }

  definitionChanged() {

  }

  nodeSelect(event) {
  }

  save() {
    this.genesisDataService.saveDefinition(this.draftDefinition, this.gameService.getCurrent().realm.id)
    .subscribe(() => {
      this.onSaved(true);
    }, () => {
      this.onSaved(false);
    });
  }

  delete() {
    this.genesisDataService.deleteDefinition(<string> this.selectedDefinition.definitionGuid, this.selectedModule.id )
      .subscribe(() => {
        this.genesisDataService.getDefinitionsByRealm(this.gameService.getCurrent().realm.id)
          .subscribe(defs => {
            this.realmDefinitionService.setDefinitions(defs.moduleDefinitions);
            this.realmHubSenderService.reloadRealmDefinitionModules({
              moduleId: this.selectedModule.id,
              realmId: this.gameService.getCurrent().realm.id
            });
          });
    });
  }

  onSaved(updated: boolean) {
    if (updated) {
     this.genesisDataService.getDefinitionsByRealm(this.gameService.getCurrent().realm.id)
          .subscribe(defs => {
            this.realmDefinitionService.setDefinitions(defs.moduleDefinitions);
            this.realmHubSenderService.reloadRealmDefinitionModules({
              moduleId: this.selectedModule.id,
              realmId: this.gameService.getCurrent().realm.id
            });
          });
    }

    this.changeDetectorRef.markForCheck();
  }

  onDefinitionClick(definition: Untold.ClientDefinition) {
    this.selectedDefinition = definition;
    this.prepareDropdowns();
  }

  onDraftUpdated(definition: Untold.ClientDefinition) {
    this.draftDefinition = definition;
  }

  showDefinitionForm(parent: Untold.ClientDefinition) {
    this.showAddDefinition = true;
    this.definitionName = '';
    this.addDefinitionParent = parent;
  }

  closeAddDefinition(decision: boolean) {
    if (decision) {
      const definition: Untold.ClientDefinition = <Untold.ClientDefinition> {
        name: this.definitionName,
        moduleGuid: this.selectedModule.guid
      };

      if (this.addDefinitionParent) {
        definition.parentDefinitionGuid = this.addDefinitionParent.definitionGuid;
        definition.definitions = JSON.parse(JSON.stringify(this.addDefinitionParent.definitions));
        definition.definitions.forEach(def => def.inherited = true);
      }

      this.genesisDataService.saveDefinition(definition, this.gameService.getCurrent().realm.id)
        .subscribe(() => {
          this.onSaved(true);
        }, () => {
          this.onSaved(false);
        });
    }

    this.definitionName = '';
    this.showAddDefinition = false;
    this.addDefinitionParent = null;
  }
}
