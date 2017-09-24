import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import {SelectItem} from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { TreeNodeService } from '../../../shared/services/tree-node.service';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { GameService } from '../../../store/services/game.service';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';

@Component({
  selector: 'app-edit-definition',
  templateUrl: './edit-definition.component.html',
  styleUrls: ['./edit-definition.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDefinitionComponent implements OnInit {
  @Input() editedDefinition: Untold.ClientDefinition;
  @Input() modules: Array<SelectItem>;
  @Output() onSaved = new EventEmitter<boolean>();

  editedDefinitionDraft: Untold.ClientDefinition;
  selectedDataType: any;
  availableDataTypes: Array<SelectItem>;
  addMemberName: string;
  addedMemberIsCalculated: boolean;
  addedMemberIsList: boolean;
  showOwnMembers: boolean;
  memberFilterText: string;
  busy: boolean;
  displayChoiceConfig: boolean;
  displayListConfig: boolean;
  memberBeingConfigured: Untold.ClientInnerDefinition;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private treeNodeService: TreeNodeService,
              private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private realmDefinitionService: RealmDefinitionService) { }

  ngOnInit() {

    this.showOwnMembers = true;
    this.editedDefinitionDraft = JSON.parse(JSON.stringify(this.editedDefinition));

    this.recalculateAvailableDataTypes();
    this.changeDetectorRef.markForCheck();
  }

  recalculateAvailableDataTypes() {
    let definitions = [];
    this.modules.forEach(mod => {
      definitions = [...definitions, ...mod.value.definitions];
    });

    const valid = this.treeNodeService.getValidMembersFrom(this.editedDefinitionDraft, definitions);
    console.log('Valid: ' + valid.length);

    this.setAvailableDataTypes(valid);
    this.selectedDataType = this.availableDataTypes[0].value;
  }

  deleteMemberFromDefinition(member: Untold.ClientInnerDefinition) {
    this.editedDefinitionDraft.definitions = this.editedDefinitionDraft.definitions.filter(def => {
      return def !== member;
    });
  }

  save() {
    this.busy = true;

    this.genesisDataService.saveDefinition(this.editedDefinitionDraft, this.gameService.getCurrent().realm.id)
      .subscribe(() => {
       this.onSaved.emit(true);
      },
      () => {
        this.busy = false;
        console.log('Fail');
        this.onSaved.emit(false);
      });
  }

  cancel() {
    this.onSaved.emit(false);
  }

  addMemberToDefinition() {
    const isComplex = this.selectedDataType.dataType === 'Definition';

    this.editedDefinitionDraft.definitions = [...this.editedDefinitionDraft.definitions, {
      dataType: this.selectedDataType.dataType,
      definitionGuid: isComplex ? this.selectedDataType.definition.definitionGuid : '',
      definitions: isComplex ? this.selectedDataType.definition.definitions : '',
      parentDefinitionGuid: isComplex ? this.selectedDataType.definition.parentDefinitionGuid : '',
      moduleGuid: isComplex ? this.selectedDataType.definition.moduleGuid : '',
      name: this.addMemberName,
      inherited: isComplex && this.selectedDataType.definition.parentDefinitionGuid,
      isCalculated: isComplex ?  false : (this.addedMemberIsCalculated ? true : false),
      isList: this.addedMemberIsList,
      occurrenceGuid: null,
      rules: []
    }];

    this.selectedDataType = this.availableDataTypes[0];
    this.addMemberName = '';
    this.addedMemberIsList = false;
    this.showOwnMembers = true;

    this.recalculateAvailableDataTypes();
    this.changeDetectorRef.markForCheck();
  }

  memberNameChanged() {
    this.changeDetectorRef.markForCheck();
  }

  showChoiceConfig(member: Untold.ClientInnerDefinition) {
    this.memberBeingConfigured = member;
    this.displayChoiceConfig = true;
  }

  showListConfig(member: Untold.ClientInnerDefinition) {
    this.memberBeingConfigured = member;
    this.displayListConfig = true;
  }

  hideConfiguration(event) {
    this.displayChoiceConfig = false;
    this.displayListConfig = false;
  }

  onRuleCompleted(event) {
    if (event) {
      this.editedDefinitionDraft.rules = event;
    }
  }

  private setAvailableDataTypes(definitions: Array<Untold.ClientDefinition>) {
     this.availableDataTypes = [
      {
        label: 'text',
        value: {
          dataType: 'text'
        }
      },
      {
        label: 'number',
        value: {
          dataType: 'number'
        }
      },
      {
        label: 'yes/no',
        value: {
          dataType: 'bool'
        }
      },
      {
        label: 'choice',
        value: {
          dataType: 'choice'
        }
      }];

      const moduleNames = {};
      this.modules.forEach(mod => {
        const module = <Untold.ClientModuleDefinitions> mod.value;
        moduleNames[<string> module.guid] = module.name;
      });

      const mappedDef = definitions.map(def => {
        return {
          label: moduleNames[<string> def.moduleGuid] + ' - ' + def.name,
          value: {
            dataType: 'Definition',
            definition: def
          }
        };
      });

      this.availableDataTypes = [...this.availableDataTypes, ...mappedDef];
  }

}
