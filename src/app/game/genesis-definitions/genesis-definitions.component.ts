import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';

import { TreeNode } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';

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
  definitions: TreeNode[];
  selectedNode: TreeNode;
  modules: Array<SelectItem>;
  moduleDefinitions: Array<SelectItem>;
  selectedModule: Untold.ClientModuleDefinitions;
  selectedDefinition: Untold.ClientDefinition;
  editedDefinition: Untold.ClientDefinition;
  createVisible: boolean;
  busy: boolean;
  realmDefinitions:  Array<Untold.ClientModuleDefinitions>;
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
    this.definitionSubscription = this.realmDefinitionService.definitions.subscribe(realmDefinitions => {
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

  showEdit(parentDefinitionNode: TreeNode, currentDefinitionNode: TreeNode) {
    this.createVisible = true;

    if (parentDefinitionNode) {
       this.editedDefinition = <Untold.ClientDefinition> {
         parentDefinitionGuid: parentDefinitionNode.data.definitionGuid
       };

       this.editedDefinition.definitions = JSON.parse(JSON.stringify(parentDefinitionNode.data.definitions));

       this.editedDefinition.definitions.forEach(def => {
         def.inherited = true;
       });

    } else if (currentDefinitionNode) {
       this.editedDefinition = currentDefinitionNode.data;
    } else {
       this.editedDefinition = <Untold.ClientDefinition> {};
       this.editedDefinition.definitions  = [];
    }

    this.editedDefinition.moduleGuid = this.selectedModule.guid;
    this.changeDetectorRef.markForCheck();
  }

  loadNode(event) {
    console.log('Opening');
    if (event.node) {
      this.treeNodeService.getTreeLayerFromDefinitions(event.node, this.selectedModule.definitions);
      this.changeDetectorRef.markForCheck();
    }
  }

  deleteNode(currentDefinitionNode: TreeNode) {
    this.genesisDataService.deleteDefinition(<string> currentDefinitionNode.data.definitionGuid, this.selectedModule.id )
      .subscribe(() => {
        this.selectedNode = null;
        this.createVisible = false;
        this.busy = false;

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
      this.selectedNode = null;
      this.createVisible = false;
      this.busy = false;

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

  createEntity(currentDefinitionNode: TreeNode) {
    this.gameWorkflowEntityService.createEntity(currentDefinitionNode.data);
  }

  createSheet(currentDefinitionNode: TreeNode) {
    this.gameWorkflowSheetService.createSheet(currentDefinitionNode.data);
  }

  private loadTree() {
    if (!this.selectedModule) {
      return;
    }

    this.definitions = this.treeNodeService.getTreeLayerFromDefinitions(null, this.selectedModule.definitions).data;
  }
}
