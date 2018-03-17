import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SelectItem } from 'primeng/primeng';

import { SheetElement, SheetElementOperation, OccuranceChainElement } from '../../../../shared/models/sheet-element';
import { Sheet } from '../../../../store/models/sheet';
import { Untold } from '../../../../shared/models/backend-export';
import { RealmDefinitionService } from '../../../../store/services/realm-definition.service';
import { DefinitionEnhancerService } from '../../../../shared/services/expressions/definition-enhancer.service';
import { SheetEnhancerService } from '../../../../shared/services/expressions/sheet-enhancer.service';
import { SheetBuilderService } from '../../../../shared/services/expressions/sheet-builder.service';
import { DefinitionChartConfig } from '../../../../shared/models/definition-chart-config';
@Component({
  selector: 'app-sheet-builder',
  templateUrl: './sheet-builder.component.html',
  styleUrls: ['./sheet-builder.component.scss']
})
export class SheetBuilderComponent implements OnInit {
  @Input() rootElement: SheetElement;
  @Input() definition: Untold.ClientDefinition;
  @Output() onSheetElementUpdate = new EventEmitter<SheetElement>();
  editorVisible: boolean;
  definitionPickerVisible: boolean;
  selectedSheetElement: SheetElement;
  gridSizes: SelectItem[];
  scopes: SelectItem[];
  IsDefinitionPickerForProperties: boolean;
  addGridSize: any;
  updateGridSize: any;
  addTextValue: string;
  targetDefinition: Untold.ClientDefinition;
  elementScopes: OccuranceChainElement[][];
  pickerDefinition: Untold.ClientDefinition;
  propertyName: string;
  expressionMapping: string;
  definitionChartConfig: DefinitionChartConfig;
  constructor(private realmDefinitionService: RealmDefinitionService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private sheetEnhancerService: SheetEnhancerService,
              private sheetBuilderService: SheetBuilderService) { }

  ngOnInit() {

    this.gridSizes = [
      {label: 'Full row', value: {numerator: 1, denominator: null}},
      {label: '50% (1-2)', value: {numerator: 1, denominator: 2}},
      {label: '33% (1-3)', value: {numerator: 1, denominator: 3}},
      {label: '66% (2-3)', value: {numerator: 2, denominator: 3}},
      {label: '25% (1-4)', value: {numerator: 1, denominator: 4}},
      {label: '75% (3-4)', value: {numerator: 3, denominator: 4}},
      {label: '12% (1-8)', value: {numerator: 1, denominator: 8}},
      {label: '37% (3-8)', value: {numerator: 3, denominator: 8}},
      {label: '62% (5-8)', value: {numerator: 5, denominator: 8}},
      {label: '87% (7-8)', value: {numerator: 7, denominator: 8}},
    ];

    this.scopes = [];
  }

  childClick(event: SheetElement) {
    this.editorVisible = true;
    this.selectedSheetElement = event;
    this.addGridSize = this.gridSizes[0].value;
    this.updateGridSize = this.gridSizes[this.getGridChoicePosition(event.numerator, event.denominator)].value;
    this.addTextValue = '';
    this.expressionMapping = '';
    this.scopes = [];
    // tslint:disable-next-line:max-line-length
    this.selectedSheetElement.listElementLabelResolve = this.selectedSheetElement.listElementLabelResolve ? this.selectedSheetElement.listElementLabelResolve : '';

    if (this.selectedSheetElement.parentId) {
      this.elementScopes = this.sheetBuilderService.getElementScopes(this.rootElement, this.selectedSheetElement);
    } else {
      this.elementScopes = [];
    }

    this.scopes = this.elementScopes.map(scope => {
      const def = this.sheetBuilderService.getInnerDefinitionFromScope(<any> this.definition, scope);
      return {
        label: def.name,
        value: def
      };
    });

    this.scopes = [{label : this.definition.name, value: this.definition}, ... this.scopes];
    this.pickerDefinition = this.scopes[0].value;

    if (this.selectedSheetElement.definitionOccurenceGuidChain) {
      // tslint:disable-next-line:max-line-length
      const pickedDefinition = this.sheetBuilderService.getInnerDefinitionFromScope(<any> this.definition, this.selectedSheetElement.definitionOccurenceGuidChain);
      this.propertyName = pickedDefinition ? pickedDefinition.name : '[NOT SET]';
    } else {
      this.propertyName = '[NOT SET]';
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
    this.rootElement = this.sheetBuilderService.deleteElement(this.rootElement, sheetElement);
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  addGrid(sheetElement: SheetElement, operation: string) {
    this.rootElement = this.sheetBuilderService.addGrid(this.rootElement,
      sheetElement, operation, this.addGridSize.numerator, this.addGridSize.denominator);

    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  addTextControl(sheetElement: SheetElement) {
    this.rootElement = this.sheetBuilderService.addTextControl(this.rootElement, sheetElement);

    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  addPropertyControl(sheetElement: SheetElement) {
    this.rootElement = this.sheetBuilderService.addPropertyControl(this.rootElement, sheetElement);

    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  addRepeater(sheetElement: SheetElement) {
    this.rootElement = this.sheetBuilderService.addRepeater(this.rootElement, sheetElement);

    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  addButton(sheetElement: SheetElement) {
    this.rootElement = this.sheetBuilderService.addButton(this.rootElement, sheetElement);

    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  update(sheetElement: SheetElement) {
    // tslint:disable-next-line:max-line-length
    this.rootElement = this.sheetBuilderService.rebuildRecursively(this.rootElement, { action: 'update', subject: sheetElement, targetId: sheetElement.id});
    this.editorVisible = false;
    this.onSheetElementUpdate.emit(this.rootElement);
  }

  showDefinitionPickerForProperties() {
    this.definitionChartConfig = {
      edit: false,
      clickableListMembers: true,
      clickableNonListProperty: true,
      clickablePredefinedListProperty: false,
      clickableUserListProperty: false,
      showListMembers: true,
      showNonListProperty: true,
      showPredefinedListProperty: true,
      showUserListProperty: false
    };

    this.definitionPickerVisible = true;
    this.editorVisible = false;
    this.IsDefinitionPickerForProperties = true;
  }

  showDefinitionPickerForListProperties() {
    this.definitionChartConfig = {
      edit: false,
      clickableListMembers: false,
      clickableNonListProperty: false,
      clickablePredefinedListProperty: true,
      clickableUserListProperty: true,
      showListMembers: true,
      showNonListProperty: false,
      showPredefinedListProperty: true,
      showUserListProperty: true
    };

    this.definitionPickerVisible = true;
    this.editorVisible = false;
    this.IsDefinitionPickerForProperties = true;
  }

  showDefinitionPickerForExpressions() {
    this.definitionChartConfig = {
      edit: false,
      clickableListMembers: true,
      clickableNonListProperty: true,
      clickablePredefinedListProperty: false,
      clickableUserListProperty: false,
      showListMembers: true,
      showNonListProperty: true,
      showPredefinedListProperty: true,
      showUserListProperty: false
    };

    this.definitionPickerVisible = true;
    this.editorVisible = false;
    this.IsDefinitionPickerForProperties = false;
  }

  onDefinitionChainClick(definitionChain: Untold.ClientInnerDefinition[]) {
    this.definitionPickerVisible = false;
    this.editorVisible = true;

    if (this.IsDefinitionPickerForProperties) {
      this.selectedSheetElement.definitionOccurenceGuidChain =
        definitionChain.filter(def => def.occurrenceGuid).map(def => {
          return {
            occuranceGuid: <string> def.occurrenceGuid
          };
        });

        const lastDefinition = definitionChain[definitionChain.length - 1];
        this.selectedSheetElement.content = lastDefinition.name;
        this.selectedSheetElement.propertyType = lastDefinition.dataType;
    } else {
      this.expressionMapping = '';

      if (this.definition === this.pickerDefinition) {
        this.expressionMapping = 'entity';
      } else {
        // tslint:disable-next-line:max-line-length
       /* const chainToFindList = this.definitionEnhancerService.findDefinitionContainerChain(<Untold.ClientInnerDefinition> this.definition, <Untold.ClientInnerDefinition> this.elementScopeDefinitionOccurance);
        const listNamePart = this.sheetEnhancerService.getListNamePart(chainToFindList);

        this.expressionMapping = 'listOf' + listNamePart;*/
      }
    }
  }
}
