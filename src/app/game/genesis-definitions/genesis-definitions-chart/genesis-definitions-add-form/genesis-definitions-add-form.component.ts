import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';

import {SelectItem} from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';
import { TreeNodeService } from '../../../../shared/services/tree-node.service';

@Component({
  selector: 'app-genesis-definitions-add-form',
  templateUrl: './genesis-definitions-add-form.component.html',
  styleUrls: ['./genesis-definitions-add-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenesisDefinitionsAddFormComponent implements OnInit {
  @Input() definition: Untold.ClientDefinition;
  @Input() realmDefinitions: Array<Untold.ClientModuleDefinitions>;
  @Output() onUpdated = new EventEmitter<Untold.ClientInnerDefinition>();

  draftDefinition: Untold.ClientInnerDefinition;
  selectedDataType: any;
  availableDataTypes: Array<SelectItem>;

  constructor(private treeNodeService: TreeNodeService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.draftDefinition = {
      definitionGuid: '',
      dataType: 'text',
      occurrenceGuid: null,
      inherited: false,
      isCalculated: false,
      isList: false,
      collectionChoiceList: null,
      choiceModule: '',
      choiceTable: '',
      choiceColumn: '',
      definitions: null,
      parentDefinitionGuid: '',
      moduleGuid: '',
      name: '',
      rules: [],
    };

    this.recalculateAvailableDataTypes();
  }

  recalculateAvailableDataTypes() {
    let definitions = [];
    this.realmDefinitions.forEach(mod => {
      definitions = [...definitions, ...mod.definitions];
    });

    const valid = this.treeNodeService.getValidMembersFrom(this.definition, definitions);
    console.log('Valid: ' + valid.length);

    this.setAvailableDataTypes(valid);
    this.selectedDataType = this.availableDataTypes[0].value;
    this.updateDraftItem();
  }

  memberNameChanged() {
    this.changeDetectorRef.markForCheck();
    this.updateDraftItem();
  }

  dataTypeChanged() {
    this.updateDraftItem();
  }

  updateDraftItem() {
    const isComplex = this.selectedDataType.dataType === 'Definition';

    this.draftDefinition.definitionGuid = isComplex ? this.selectedDataType.definition.definitionGuid : '';
    this.draftDefinition.definitions = isComplex ? this.selectedDataType.definition.definitions : '';
    this.draftDefinition.parentDefinitionGuid = isComplex ? this.selectedDataType.definition.parentDefinitionGuid : '';
    this.draftDefinition.moduleGuid = isComplex ? this.selectedDataType.definition.moduleGuid : '';
    this.draftDefinition.inherited = isComplex && this.selectedDataType.definition.parentDefinitionGuid;
    this.draftDefinition.isCalculated = isComplex ?  false : this.draftDefinition.isCalculated;
    this.draftDefinition.dataType = this.selectedDataType.dataType;

    this.onUpdated.emit(this.draftDefinition);
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
     this.realmDefinitions.forEach(mod => {
       const module = <Untold.ClientModuleDefinitions> mod;
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
