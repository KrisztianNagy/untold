import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { SelectItem } from 'primeng/primeng';
import { TreeNode } from 'primeng/primeng';

import { TreeNodeService } from '../../../../../shared/services/tree-node.service';
import { Untold } from '../../../../../shared/models/backend-export';
import { ExpressionResult } from '../../../../../shared/models/expression-result';
import { CalculatedExpressionService } from '../../../../../shared/services/expressions/calculated-expression.service';
import { ExpressionEvaluatorService } from '../../../../../shared/services/expressions/expression-evaluator.service';
import { GenesisEntity, GenesisTreeNode } from '../../../../../shared/models/genesis-entity';

@Component({
  selector: 'app-edit-rule',
  templateUrl: './edit-rule.component.html',
  styleUrls: ['./edit-rule.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditRuleComponent implements OnInit {
  @Input() editedDefinition: Untold.ClientInnerDefinition;
  @Input() rule: Untold.ClientDefinitionRule;
  @Input() modules: Array<SelectItem>;
  @Output() onCompleted = new EventEmitter<Untold.ClientDefinitionRule>();

  result: ExpressionResult;
  testResult: string;
  tree: TreeNode[];
  testEntity: GenesisEntity;
  caretPos = 0;
  targetDefinitions: Array<SelectItem>;
  selectedTargetDefinition: string;
  resolvedExpresion: string;
  isReadOnly: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private calculatedExpressionService: CalculatedExpressionService,
              private expressionEvaluatorService: ExpressionEvaluatorService,
              private treeNodeService: TreeNodeService) { }

  ngOnInit() {
    this.targetDefinitions = [{label: 'Select rule target', value: null}];
    this.processDefinition(this.editedDefinition, '', true);
    this.tree = [this.treeNodeService.getDefinitionMemberTree(<Untold.ClientInnerDefinition> this.editedDefinition)];

    if (this.rule.target) {
      const match = this.targetDefinitions.filter(def => def.value === this.rule.target);

      if (match.length) {
        this.selectedTargetDefinition = match[0].value;
        this.isReadOnly = true;
      }
    }

    this.testEntity = {
      definition: <Untold.ClientInnerDefinition> this.editedDefinition,
      entity: this.treeNodeService.getEmptyGenesisEntityFromDefinitionTree(<GenesisTreeNode> this.tree[0])
    };

    this.expressionChanged();
  }

  update() {
    this.onCompleted.emit({
      target: this.selectedTargetDefinition,
      expression: this.rule.expression
    });
  }

  cancel() {
    this.onCompleted.emit(null);
  }

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart === 0) {
       this.caretPos = oField.selectionStart;
    }
  }

  insertBuilderScript(event) {
    if (!this.rule.expression) {
      this.rule.expression = event;
    } else {
      this.rule.expression = this.rule.expression.substr(0, this.caretPos) + event + this.rule.expression.substr(this.caretPos);
    }

    this.expressionChanged();
  }

  expressionChanged() {
    setTimeout(() => {
      this.resolvedExpresion = '';

      if (!this.rule.expression || !this.rule.expression.trim()) {
        this.result = {
          error: false,
          errorMessage: '',
          tree: null
        };

        this.testResult = '';
        this.changeDetectorRef.markForCheck();

        return;
      }

      const spaceless = this.calculatedExpressionService.removeSpareSpaces(this.rule.expression.trim());

      if (spaceless === null) {

        this.result = {
          error: true,
          errorMessage: 'Unfinished literal',
          tree: null
        };

        this.testResult = '';
        this.changeDetectorRef.markForCheck();

        return;
      }

      this.result = this.calculatedExpressionService.parseTree(spaceless);

      if (this.result.error) {

        this.testResult = '';
        this.changeDetectorRef.markForCheck();
      } else {
        if (this.calculatedExpressionService.resolveNode(this.result.tree, <any> this.editedDefinition) === null) {

          this.result = {
            error: true,
            errorMessage: 'Cannot find identifier',
            tree: null
          };

          this.testResult = '';
          this.changeDetectorRef.markForCheck();

          return;
        }

        this.expressionEvaluatorService.processExpression(this.result.tree, this.testEntity).subscribe(res => {
          this.testResult = typeof(res) === 'boolean' ? (res ? 'true' : 'false') : res;
          this.changeDetectorRef.markForCheck();
        }, err => {
          this.testResult = err;
          this.changeDetectorRef.markForCheck();
        });
      }
    }, 0);
  }

  updateTestEntity(event) {
    this.testEntity.entity = event.entity;
    this.expressionChanged();
  }

  private processDefinition(definition: Untold.ClientInnerDefinition,
                            displayName: string, root: boolean) {
    if (definition) {
      if (!root) {
        if (displayName) {
          displayName += '.';
        }
        displayName += definition.name;
      }

      if (!definition.isList) {
        if (!root && definition.isCalculated) {
          this.targetDefinitions.push({label: displayName, value: definition.occurrenceGuid});
        }

        if (definition.definitions) {
          definition.definitions
            .forEach(def => this.processDefinition(def, displayName, false));
        }
      }
    }
  }
}
