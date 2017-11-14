import { Component, OnInit, Input, Output, OnChanges, SimpleChanges,
         EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation  } from '@angular/core';

import { TreeNode } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';
import { OrganizationChart } from 'primeng/primeng';
import { Dialog } from 'primeng/primeng';
import { OrderList } from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { TreeNodeService } from '../../../shared/services/tree-node.service';

@Component({
  selector: 'app-genesis-definitions-chart',
  templateUrl: './genesis-definitions-chart.component.html',
  styleUrls: ['./genesis-definitions-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class GenesisDefinitionsChartComponent implements OnInit, OnChanges {
  @Input() definition: Untold.ClientDefinition;
  @Input() realmDefinitions: Array<Untold.ClientModuleDefinitions>;
  @Input() simplified: boolean;
  @Output() onDefinitionClick = new EventEmitter<Untold.ClientDefinition>();
  @Output() onDraftUpdated = new EventEmitter<Untold.ClientDefinition>();

  organizationTree: TreeNode[];
  draftDefinition: Untold.ClientDefinition;
  editNameDefinition: Untold.ClientDefinition;
  orderedDefinitions: Array<Untold.ClientInnerDefinition>;
  choiceDefinition: Untold.ClientInnerDefinition;
  choiceDefinitionResponse: Untold.ClientInnerDefinition;
  listDefinition: Untold.ClientInnerDefinition;
  listDefinitionResponse: Untold.ClientInnerDefinition;
  addedMemberDefinition: Untold.ClientInnerDefinition;
  ruleDefinition: Untold.ClientInnerDefinition;
  ruleDefinitionResponse: Untold.ClientInnerDefinition;
  editedRule: Untold.ClientDefinitionRule;
  rulePosition?: number;
  displayAddForm: boolean;

  constructor(private treeNodeService: TreeNodeService,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editNameDefinition = null;
    this.orderedDefinitions = null;
    this.displayAddForm = false;
    this.choiceDefinition = null;
    this.choiceDefinitionResponse = null;
    this.listDefinition = null;
    this.listDefinitionResponse = null;
    this.ruleDefinition = null;
    this.ruleDefinitionResponse = null;
    this.editedRule = null;
    this.draftDefinition = JSON.parse(JSON.stringify(this.definition));
    this.loadChart();
  }

  loadChart() {
    this.organizationTree = null;
    this.changeDetectorRef.markForCheck();
    this.onDraftUpdated.emit(this.draftDefinition);

    setTimeout(() => {
      this.organizationTree = this.treeNodeService.getOrganizationChartFromDefinitions(this.draftDefinition, this.simplified);
      this.changeDetectorRef.markForCheck();
    }, 40);
  }

  definitionClick(definition: Untold.ClientInnerDefinition) {

    if (!this.simplified || definition.dataType !== 'Definition' || definition.isList) {
      this.onDefinitionClick.emit(definition);
    }
  }

  editName(definition: Untold.ClientInnerDefinition) {
    if (this.simplified) {
      return;
    }

    this.editNameDefinition = definition;
    this.changeDetectorRef.markForCheck();
  }

  closeNameEditor(decision: boolean) {
    this.editNameDefinition = null;

    if (decision) {
      this.loadChart();
    }

    this.changeDetectorRef.markForCheck();
  }

  clickOrder() {
    this.orderedDefinitions = this.draftDefinition.definitions ? this.draftDefinition.definitions : [];
  }

  closeOrder(decision: boolean) {

    if (decision) {
      this.draftDefinition.definitions = this.orderedDefinitions;
      this.loadChart();
    }

    this.orderedDefinitions = null;
    this.changeDetectorRef.markForCheck();
  }

  clickRemove(definition: Untold.ClientInnerDefinition) {
    this.draftDefinition.definitions = this.draftDefinition.definitions.filter(def => {
      if (definition.occurrenceGuid) {
        return !def.occurrenceGuid || def.occurrenceGuid !== definition.occurrenceGuid;
      } else {
        return def.occurrenceGuid || def.name !== definition.name;
      }
    });

    this.draftDefinition = JSON.parse(JSON.stringify(this.draftDefinition));

    this.loadChart();
  }

  clickAddChild() {
    this.displayAddForm = true;
  }

  addFormUpdated(definition: Untold.ClientInnerDefinition) {
    this.addedMemberDefinition = definition;
  }

  closeAddMember(decision: boolean) {
    this.displayAddForm = false;

    if (decision) {
      this.draftDefinition.definitions = [...this.draftDefinition.definitions, this.addedMemberDefinition];
      this.loadChart();
    }

    this.addedMemberDefinition = null;
    this.changeDetectorRef.markForCheck();
  }

  clickChoice(definition: Untold.ClientInnerDefinition) {
    this.choiceDefinition = definition;
  }

  choiceConfigUpdated(definition: Untold.ClientInnerDefinition) {
    this.choiceDefinitionResponse = definition;
  }

  closeChoiceConfig(decision: boolean) {

    if (decision) {
      this.choiceDefinition.choiceColumn = this.choiceDefinitionResponse.choiceColumn;
      this.choiceDefinition.choiceModule = this.choiceDefinitionResponse.choiceModule;
      this.choiceDefinition.choiceTable = this.choiceDefinitionResponse.choiceTable;
      this.choiceDefinition.collectionChoiceList = this.choiceDefinitionResponse.collectionChoiceList;
      this.choiceDefinition.isCollectionChoice = this.choiceDefinitionResponse.isCollectionChoice;

      this.loadChart();
    }

    this.choiceDefinition = null;
    this.choiceDefinitionResponse = null;
    this.changeDetectorRef.markForCheck();
  }

  clickList(definition: Untold.ClientInnerDefinition) {
    this.listDefinition = definition;
  }

  listConfigUpdated(definition: Untold.ClientInnerDefinition) {
    this.listDefinitionResponse = definition;
  }

  closeListConfig(decision: boolean) {

    if (decision) {
      this.listDefinition.predefinedListItems = this.listDefinitionResponse.predefinedListItems;
      this.listDefinition.isPredefinedList = this.listDefinitionResponse.isPredefinedList;

      this.loadChart();
    }

    this.listDefinition = null;
    this.listDefinitionResponse = null;
    this.changeDetectorRef.markForCheck();
  }

  clickRule(definition: Untold.ClientInnerDefinition) {
    this.ruleDefinition = definition;
  }

  ruleConfigUpdated(definition: Untold.ClientInnerDefinition) {
    this.ruleDefinitionResponse = definition;
  }

  closeRuleConfig(decision: boolean) {

    if (decision) {
      this.ruleDefinition.rules = this.ruleDefinitionResponse.rules;
      this.loadChart();
    }

    this.ruleDefinition = null;
    this.ruleDefinitionResponse = null;
    this.changeDetectorRef.markForCheck();
  }

  editRule(rule?: Untold.ClientDefinitionRule) {
    if (rule) {
      this.closeRuleConfig(true);
      this.rulePosition = this.draftDefinition.rules.indexOf(rule);
      this.editedRule = rule;
    } else {
      this.closeRuleConfig(false);
      this.rulePosition = null;
      this.editedRule = {
        expression: '',
        target: ''
      };
    }
  }

  closeRuleEditor(rule?: Untold.ClientDefinitionRule) {
    if (rule) {
      if (this.rulePosition && this.rulePosition > -1) {
        this.draftDefinition.rules[this.rulePosition] = rule;
      } else {
        this.draftDefinition.rules.push(rule);
      }
    }

    this.editedRule = null;
    this.changeDetectorRef.markForCheck();
  }

  getColor(definition: Untold.ClientInnerDefinition) {
    if (!definition || !definition.dataType) {
      return 'brown';
    }

    switch (definition.dataType) {
      case 'Definition':
        return 'brown';
      default:
        return 'green';
    }
  }

  getIfFirstChild(currentDefinition: Untold.ClientInnerDefinition) {
    if (!this.draftDefinition.definitions) {
      return false;
    }

    const isFirstChild = this.draftDefinition.definitions.some(def => def.occurrenceGuid === currentDefinition.occurrenceGuid);
    return isFirstChild;
  }

  getIsUniqueName(name: string) {
    if (!name) {
      return false;
    }

    const matchingName = this.draftDefinition.definitions.some(def => def.name === name);
    return !matchingName;
  }

}
