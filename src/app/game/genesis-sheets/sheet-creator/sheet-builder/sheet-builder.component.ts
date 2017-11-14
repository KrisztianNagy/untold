import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { SheetElement, SheetElementOperation } from '../../../../shared/models/sheet-element';
import { Sheet } from '../../../../store/models/sheet';
import { Untold } from '../../../../shared/models/backend-export';
import { RealmDefinitionService } from '../../../../store/services/realm-definition.service';

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
  addGridSize: any;
  updateGridSize: any;
  addTextValue: string;
  targetDefinition: Untold.ClientDefinition;
  pickedDefinition: Untold.ClientDefinition;
  
  constructor(private realmDefinitionService: RealmDefinitionService) { }

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
    this.updateGridSize = this.gridSizes[this.getGridChoicePosition(event.numerator, event.denominator)];
    this.addTextValue = '';

    this.getContainerDefinition();
  }

  getGridChoicePosition(numerator: number, denominator: number) {
    let selectedPosition = 0;

    this.gridSizes.forEach((item, index) => {
      if (item.value.numerator === numerator &&item.value.denominator === denominator) {
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
    }

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
        }

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
    }

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

      const result = this.rebuildRecursively(child, operation)

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
      currentMaxId = this.getMaxId(child, currentMaxId)
    });

    return currentMaxId;
  }

  showDefinitionPicker() {
    this.definitionPickerVisible = true;
    this.editorVisible = false;
  }

  onDefinitionClick(definition: Untold.ClientInnerDefinition) {
    this.definitionPickerVisible = false;
    this.editorVisible = true;
    this.selectedSheetElement.definitionOccurenceGuid = <string> definition.occurrenceGuid;
    this.selectedSheetElement.content = definition.name;
    this.selectedSheetElement.propertyType = definition.dataType;
    this.selectedSheetElement.isList = definition.isList;
  }

  getContainerDefinition() {
    this.pickedDefinition = this.definition;
    // tslint:disable-next-line:max-line-length
    const cointainerDef = this.getGuidFromDefinition(<Untold.ClientInnerDefinition> this.definition, this.selectedSheetElement.parentDefinitionOccuranceGuid);

    const modules = this.realmDefinitionService.getCurrent();
    modules.forEach(mod => {
        mod.definitions.forEach(def => {
            if (cointainerDef && def.definitionGuid === cointainerDef.definitionGuid) {
                this.pickedDefinition = def;
            }
        });
    });
  }

  getGuidFromDefinition(definition: Untold.ClientInnerDefinition, occuranceGuid: string): Untold.ClientInnerDefinition {
    let found: Untold.ClientInnerDefinition = null;

    if (definition.definitions) {
      definition.definitions.forEach(def => {
        if (found) {
          return;
        }

        if (def.occurrenceGuid === occuranceGuid) {
          found = def;
          return;
        }
        const childCheck = this.getGuidFromDefinition(def, occuranceGuid);

        if (childCheck) {
          found = childCheck;
        }
      });
    }

    return found;
  }

}
