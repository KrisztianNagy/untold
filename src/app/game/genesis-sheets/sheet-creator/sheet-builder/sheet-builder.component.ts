import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { SheetElement, SheetElementOperation } from '../../../../shared/models/sheet-element';
import { Sheet } from '../../../../store/models/sheet';
import { Untold } from '../../../../shared/models/backend-export';
import { RealmDefinitionService } from '../../../../store/services/realm-definition.service';
import { DefinitionEnhancerService } from '../../../../shared/services/expressions/definition-enhancer.service';
import { SheetEnhancerService } from '../../../../shared/services/expressions/sheet-enhancer.service';

@Component({
  selector: 'app-sheet-builder',
  templateUrl: './sheet-builder.component.html',
  styleUrls: ['./sheet-builder.component.scss']
})
export class SheetBuilderComponent implements OnInit {
  @Input() sheetElement: SheetElement;
  @Input() definition: Untold.ClientDefinition;
  @Output() onSheetElementUpdate = new EventEmitter<SheetElement>();
  editorVisible: boolean;
  definitionPickerVisible: boolean;
  selectedSheetElement: SheetElement;
  gridSizes: SelectItem[];
  IsDefinitionPickerForProperties: boolean;
  addGridSize: any;
  updateGridSize: any;
  addTextValue: string;
  targetDefinition: Untold.ClientDefinition;
  elementScopeDefinition: Untold.ClientDefinition;
  elementScopeDefinitionOccurance: Untold.ClientInnerDefinition;
  pickerDefinition: Untold.ClientDefinition;
  occuranceChain: Untold.ClientInnerDefinition[];
  listChain: Untold.ClientInnerDefinition[];
  predefinedListChain: Untold.ClientInnerDefinition[];
  propertyName: string;
  expressionPickerDefinitionGuid: string;
  expressionMapping: string;
  constructor(private realmDefinitionService: RealmDefinitionService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private sheetEnhancerService: SheetEnhancerService) { }

  ngOnInit() {

    this.gridSizes = [
      {label: 'Full row', value: {numerator: 1, denominator: null}},
      {label: '50% (1-2)', value: {numerator: 1, denominator: 2}},
      {label: '33% (1-3)', value: {numerator: 1, denominator: 3}},
      {label: '66% (2-3)', value: {numerator: 2, denominator: 3}},
      {label: '25% (1-4)', value: {numerator: 1, denominator: 4}},
      {label: '50% (2-4)', value: {numerator: 2, denominator: 4}},
      {label: '75% (3-4)', value: {numerator: 3, denominator: 4}},
    ];
  }

  childClick(event: SheetElement) {
    this.editorVisible = true;
    this.selectedSheetElement = event;
    this.addGridSize = this.gridSizes[0].value;
    this.updateGridSize = this.gridSizes[this.getGridChoicePosition(event.numerator, event.denominator)].value;
    this.addTextValue = '';
    this.expressionPickerDefinitionGuid = '';
    this.expressionMapping = '';
    // tslint:disable-next-line:max-line-length
    this.selectedSheetElement.listElementLabelResolve = this.selectedSheetElement.listElementLabelResolve ? this.selectedSheetElement.listElementLabelResolve : '';

    // tslint:disable-next-line:max-line-length
    if (this.selectedSheetElement.parentDefinitionOccuranceGuid) {
      this.elementScopeDefinitionOccurance = this.definitionEnhancerService.getInnerDefinition(<Untold.ClientInnerDefinition> this.definition, this.selectedSheetElement.parentDefinitionOccuranceGuid);
      // tslint:disable-next-line:max-line-length
      this.elementScopeDefinition = this.definitionEnhancerService.findDefinitionIfExist(this.definition, <string> this.elementScopeDefinitionOccurance.definitionGuid);

      // tslint:disable-next-line:max-line-length
      this.occuranceChain = this.definitionEnhancerService.findDefinitionContainerChain(<Untold.ClientInnerDefinition> this.definition, this.elementScopeDefinitionOccurance);

      this.listChain = this.occuranceChain.filter(element => element.isList);
      this.predefinedListChain = this.occuranceChain.filter(element => element.isList && element.isPredefinedList);
    } else {
      this.elementScopeDefinition = this.definition;
      this.elementScopeDefinitionOccurance = null;
      this.occuranceChain = [];
      this.listChain = [];
      this.predefinedListChain = [];
    }

    if (this.selectedSheetElement.definitionOccurenceGuid) {
      // tslint:disable-next-line:max-line-length
      const pickedDefinition = this.definitionEnhancerService.getInnerDefinition(<Untold.ClientInnerDefinition> this.definition, this.selectedSheetElement.definitionOccurenceGuid);
      this.propertyName = pickedDefinition ? pickedDefinition.name : '[NOT SET]';
    }
  }

  getGridChoicePosition(numerator: number, denominator: number) {
    let selectedPosition = 0;

    this.gridSizes.forEach((item, index) => {
      if (item.value.numerator === numerator && item.value.denominator === denominator) {
        selectedPosition = index;
      }
    });

    return selectedPosition;
  }

  gridSizeUpdated() {
    this.selectedSheetElement.denominator = this.updateGridSize.denominator;
    this.selectedSheetElement.numerator = this.updateGridSize.numerator;
  }

  deleteElement(sheetElement: SheetElement) {
    this.sheetElement = this.rebuildRecursively(this.sheetElement, {action: 'delete', subject: null, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.sheetElement);
  }

  addGrid(sheetElement: SheetElement, operation: string) {
    const maxId = this.getMaxId(this.sheetElement);

    const element: SheetElement = {
      type: 'grid',
      id: maxId + 1,
      numerator: this.addGridSize.numerator,
      denominator: this.addGridSize.denominator,
      innerElements: [],
      parentDefinitionOccuranceGuid: sheetElement.definitionOccurenceGuid || sheetElement.parentDefinitionOccuranceGuid || null
    };

    this.sheetElement = this.rebuildRecursively(this.sheetElement, { action: operation, subject: element, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.sheetElement);
  }

  addTextControl(sheetElement: SheetElement) {
    const maxId = this.getMaxId(this.sheetElement);

        const element: SheetElement = {
          type: 'text',
          id: maxId + 1,
          content: '',
          innerElements: [],
          parentDefinitionOccuranceGuid: sheetElement.definitionOccurenceGuid || sheetElement.parentDefinitionOccuranceGuid || null
        };

        this.sheetElement = this.rebuildRecursively(this.sheetElement, { action: 'add', subject: element, targetId: sheetElement.id});
        this.editorVisible = false;
        this.onSheetElementUpdate.emit(this.sheetElement);
  }

  addPropertyControl(sheetElement: SheetElement) {
    const maxId = this.getMaxId(this.sheetElement);

    const element: SheetElement = {
      type: 'property',
      id: maxId + 1,
      content: '',
      innerElements: [],
      parentDefinitionOccuranceGuid: sheetElement.definitionOccurenceGuid || sheetElement.parentDefinitionOccuranceGuid || null
    };

    this.sheetElement = this.rebuildRecursively(this.sheetElement, { action: 'add', subject: element, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.sheetElement);
  }

  addButton(sheetElement: SheetElement) {
    const maxId = this.getMaxId(this.sheetElement);

    const element: SheetElement = {
      type: 'button',
      id: maxId + 1,
      content: '',
      innerElements: [],
      parentDefinitionOccuranceGuid: sheetElement.definitionOccurenceGuid || sheetElement.parentDefinitionOccuranceGuid || null
    };

    this.sheetElement = this.rebuildRecursively(this.sheetElement, { action: 'add', subject: element, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.sheetElement);
  }

  update(sheetElement: SheetElement) {
    this.sheetElement = this.rebuildRecursively(this.sheetElement, { action: 'update', subject: sheetElement, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.sheetElement);
  }

  rebuildRecursively(element: SheetElement, operation: SheetElementOperation): SheetElement {
    if (operation.action === 'delete' && operation.targetId === element.id) {
      return null;
    }

    let cloned: SheetElement = JSON.parse(JSON.stringify(element));

    if (operation.action === 'update' && operation.targetId === element.id) {
      cloned = JSON.parse(JSON.stringify(operation.subject));
    }

    cloned.innerElements =  [] ;
    element.innerElements.forEach(child =>  {

      if (operation.action === 'addbefore' && operation.targetId === child.id) {
        cloned.innerElements.push(operation.subject);
      }

      const result = this.rebuildRecursively(child, operation);

      if (result) {
        cloned.innerElements.push(result);
      }

      if (operation.action === 'addafter' && operation.targetId === child.id) {
        cloned.innerElements.push(operation.subject);
      }
    });

    if (operation.action === 'add' && operation.targetId === element.id) {
      cloned.innerElements.push(operation.subject);
    }

    return cloned;
  }

  getMaxId(element: SheetElement, currentMaxId: number = 0): number {
    currentMaxId = element.id > currentMaxId ? element.id : currentMaxId;

    element.innerElements.forEach(child => {
      currentMaxId = this.getMaxId(child, currentMaxId);
    });

    return currentMaxId;
  }

  showDefinitionPickerForProperties() {
    this.definitionPickerVisible = true;
    this.editorVisible = false;
    this.IsDefinitionPickerForProperties = true;
    this.pickerDefinition = this.elementScopeDefinition;
  }

  showDefinitionPickerForExpressions() {
    this.definitionPickerVisible = true;
    this.editorVisible = false;
    this.IsDefinitionPickerForProperties = false;

    if (this.expressionPickerDefinitionGuid) {
      this.pickerDefinition = this.definitionEnhancerService.findDefinitionIfExist(this.definition, this.expressionPickerDefinitionGuid);
    } else {
      this.pickerDefinition = this.definition;
    }
  }

  onDefinitionClick(definition: Untold.ClientInnerDefinition) {
    this.definitionPickerVisible = false;
    this.editorVisible = true;

    if (this.IsDefinitionPickerForProperties) {
      this.selectedSheetElement.definitionOccurenceGuid = <string> definition.occurrenceGuid;
      this.selectedSheetElement.content = definition.name;
      this.selectedSheetElement.propertyType = definition.dataType;
      this.selectedSheetElement.isList = definition.isList;
    } else {
      this.expressionMapping = '';

      if (this.definition === this.pickerDefinition) {
        this.expressionMapping = 'entity';
      } else {
        // tslint:disable-next-line:max-line-length
        const chainToFindList = this.definitionEnhancerService.findDefinitionContainerChain(<Untold.ClientInnerDefinition> this.definition, <Untold.ClientInnerDefinition> this.elementScopeDefinitionOccurance);
        const listNamePart = this.sheetEnhancerService.getListNamePart(chainToFindList);

        this.expressionMapping = 'listOf' + listNamePart;
      }

      // tslint:disable-next-line:max-line-length
      let chainToFindelement = this.definitionEnhancerService.findDefinitionContainerChain(<Untold.ClientInnerDefinition> this.pickerDefinition, definition);

      if (chainToFindelement. length < 2) {
        this.expressionMapping = '';
        return;
      }

      chainToFindelement = chainToFindelement.splice(1);
      chainToFindelement.forEach(def => {
        this.expressionMapping += '[\'' + definition.name + '\']';
      });

      this.expressionMapping = '{{ ' + this.expressionMapping + ' }}';
    }
  }
}
