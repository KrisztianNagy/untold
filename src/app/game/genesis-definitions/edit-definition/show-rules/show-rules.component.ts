import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import {SelectItem} from 'primeng/primeng';

import { Untold } from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-show-rules',
  templateUrl: './show-rules.component.html',
  styleUrls: ['./show-rules.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowRulesComponent implements OnInit {
  @Input() editedDefinition: Untold.ClientDefinition;
  @Input() modules: Array<SelectItem>;
  @Output() onCompleted = new EventEmitter<Array<Untold.ClientDefinitionRule>>();

  editMode: boolean;
  rule: Untold.ClientDefinitionRule;
  ruleNames: Array<string>;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.ruleNames = [];
    this.resolveRuleName(<Untold.ClientInnerDefinition> this.editedDefinition, '', true);
  }

  editRule(rule: Untold.ClientDefinitionRule) {
    this.rule = JSON.parse(JSON.stringify(rule));
    this.editMode = true;
  }

  addRule() {
    this.rule = {
      expression: '',
      target: ''
    };

    this.editMode = true;
  }

  deleteRule(rule) {
    this.editedDefinition.rules = this.editedDefinition.rules.filter(rl => rule !== rl);
  }

  onCompletedChild(event: Untold.ClientDefinitionRule) {
    if (event) {

      if (this.editedDefinition.rules) {
        const found = this.editedDefinition.rules.filter(rule => rule.target === this.rule.target);

        if (found.length) {
          found[0].expression = event.expression;
        } else {
          this.editedDefinition.rules = [...this.editedDefinition.rules, event];
        }
      } else {
        this.editedDefinition.rules = [event];
      }
    }

    this.rule = null;
    this.editMode = false;

    this.onCompleted.emit(this.editedDefinition.rules);
  }

  move(rule: Untold.ClientDefinitionRule, up: boolean) {
    const pos = this.editedDefinition.rules.indexOf(rule);

    if (up && pos > 0) {
      const temp =  this.editedDefinition.rules[pos - 1];
      this.editedDefinition.rules[pos - 1] =  this.editedDefinition.rules[pos];
      this.editedDefinition.rules[pos] = temp;
    } else if (!up && pos <  this.editedDefinition.rules.length - 1) {
      const temp =  this.editedDefinition.rules[pos + 1];
      this.editedDefinition.rules[pos + 1] =  this.editedDefinition.rules[pos];
      this.editedDefinition.rules[pos] = temp;
    }
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

}
