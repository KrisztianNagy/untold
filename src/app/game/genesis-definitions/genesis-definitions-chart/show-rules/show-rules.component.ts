import { Component, OnInit, Input, Output, EventEmitter,
         ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';

import {SelectItem} from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-show-rules',
  templateUrl: './show-rules.component.html',
  styleUrls: ['./show-rules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ShowRulesComponent implements OnInit {
  @Input() definition: Untold.ClientInnerDefinition;
  @Output() onSelected = new EventEmitter<Untold.ClientDefinitionRule>();
  @Output() onUpdated = new EventEmitter<Untold.ClientInnerDefinition>();

  draftDefinition: Untold.ClientInnerDefinition;

  rule: Untold.ClientDefinitionRule;
  ruleNames: Array<string>;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.draftDefinition = JSON.parse(JSON.stringify(this.definition));

    this.ruleNames = [];
    this.resolveRuleName(<Untold.ClientInnerDefinition> this.draftDefinition, '', true);
  }

  editRule(rule: Untold.ClientDefinitionRule) {
    this.update();
    this.onSelected.emit(rule);
  }

  addRule() {
    const rule = {
      expression: '',
      target: ''
    };

    this.editRule(rule);
  }

  deleteRule(rule) {
    this.draftDefinition.rules = this.draftDefinition.rules.filter(rl => rule !== rl);
    this.update();
  }

  private resolveRuleName(definition: Untold.ClientInnerDefinition,
                            displayName: string, root: boolean) {
    if (definition) {
      if (!root) {
        if (displayName) {
          displayName += '.';
        }
        displayName += definition.name;
      }

      if (!definition.isList) {
        if (!root) {
          this.ruleNames[<string>definition.occurrenceGuid] = displayName;
        }

        if (definition.definitions) {
          definition.definitions
            .forEach(def => this.resolveRuleName(def, displayName, false));
        }
      }
    }
  }

  update() {
    this.onUpdated.emit(this.draftDefinition);
  }

}
