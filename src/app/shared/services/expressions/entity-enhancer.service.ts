import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../models/backend-export';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { StorageDataService } from '../rest/storage-data.service';
import { EntityTableRow } from '../../models/data-table';
import { RuleDefinition } from '../../models/rule-definition';
import { GenesisEntity } from '../../models/genesis-entity';
import { CalculatedExpressionService } from './calculated-expression.service';
import { ExpressionEvaluatorService } from './expression-evaluator.service';

@Injectable()
export class EntityEnhancerService {

  constructor(private realmDefinitionService: RealmDefinitionService,
              private storageDataService: StorageDataService,
              private expressionEvaluatorService: ExpressionEvaluatorService,
              private calculatedExpressionService: CalculatedExpressionService) {

  }

  updateEntityDefinition(entity: Untold.ClientEntity) {
    const modules = this.realmDefinitionService.getCurrent();

    modules.forEach(mod => {
      mod.definitions.forEach(def => {
        if (def.definitionGuid === entity.definitionGuid) {
          (<GenesisEntity> entity.entity).definition = <Untold.ClientInnerDefinition> def;
          return;
        }
      });
    });

    this.ensureEntityStructure((<GenesisEntity> entity.entity));
  }

  saveEntity(entity: Untold.ClientEntity, realm: Untold.ClientRealm): Observable<Response> {
    const tableRow: EntityTableRow = {
      PartitionKey: 'entity',
      RowKey: entity.id.toString(),
      rowStatus: 1,
      entity: entity.entity
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Entities', realm.entityEditorAcccessSignature);
  }

  loadEntity(entity: Untold.ClientEntity, realm: Untold.ClientRealm):
    AsyncSubject<Untold.ClientEntity> {

    const subject = new AsyncSubject<Untold.ClientEntity>();

    const tableRow: EntityTableRow = {
      PartitionKey: 'entity',
      RowKey: entity.id.toString(),
      rowStatus: 1,
      entity: entity.entity
    };

    this.storageDataService.readRow('RM' + realm.id + 'Entities', 'entity', entity.id.toString(), realm.entityReaderAcccessSignature)
      .subscribe(res => {
        const storageEntity = JSON.parse(res);

        const loadedEntity: Untold.ClientEntity = JSON.parse(JSON.stringify(entity));
        loadedEntity.entity = storageEntity.value && storageEntity.value['entity'] ? storageEntity.value['entity'] : {};

        subject.next(loadedEntity);
        subject.complete();
      }, err => {
        const loadedEntity: Untold.ClientEntity = JSON.parse(JSON.stringify(entity));
        entity.entity = {};

        subject.next(loadedEntity);
        subject.complete();
      });

      return subject;
  }

  recalculate(entity: GenesisEntity): AsyncSubject<GenesisEntity> {
    const recalculateSubject = new AsyncSubject<GenesisEntity>();

    entity = JSON.parse(JSON.stringify(entity));
    const calcFunctions = [];
    const rules = this.flattenRules(<Untold.ClientInnerDefinition> entity.definition);

    if (rules.length) {
      const rulesSubject = new Subject<number>();

      rulesSubject.subscribe(pos => {
        const rule = rules[pos];

        this.recalculateRule(entity, rule).subscribe(() => {;

          if (pos < rules.length) {
            rulesSubject.next(pos + 1);
          } else {
            rulesSubject.complete();
            recalculateSubject.next(entity);
            recalculateSubject.complete();
          }
        });
      });

      rulesSubject.next(0);
    } else {
      recalculateSubject.next(entity);
      recalculateSubject.complete();
    }

    return recalculateSubject;
  }

  private recalculateRule(entity: GenesisEntity, rule: RuleDefinition): AsyncSubject<boolean> {
    const subject = new AsyncSubject<boolean>();

    const ruleScopes = this.getContainers(entity.entity, <string> rule.definition.occurrenceGuid)
     .map(obj => {
        return {
          entity: obj[<string> rule.rule.target],
          definition: rule.definition
        };
      });

    if (ruleScopes.length) {
      const spaceless = this.calculatedExpressionService.removeSpareSpaces(rule.rule.expression.trim());

      if (spaceless === null) {
        return;
      }

      const tree = this.calculatedExpressionService.parseTree(spaceless);

      ruleScopes.forEach(scope => {
        const targetContainer = this.getContainers(scope.entity, <string> rule.rule.target);

        if (targetContainer && targetContainer.length > 0) {
          this.expressionEvaluatorService.processExpression(tree.tree, scope)
            .subscribe(val => {
              targetContainer[<string> rule.rule.target] = val;
              subject.next(true);
              subject.complete();
            }, err => {
              subject.next(false);
              subject.complete();
            });
        } else {
          subject.next(false);
          subject.complete();
        }
      });
    } else {
      subject.next(false);
      subject.complete();
    }

    return subject;
  }

  private getContainers(container: Object, targetName: string): Array<Object> {

    const retVal: Array<Object> = [];

    for (const property in container) {
      if (container.hasOwnProperty(property)) {

        if (property === targetName) {
          retVal.push(container);
        }

        const isObject = typeof(property) === 'object';
        const listElements = container[property]['listElements'];

        if (isObject && !listElements) {
          this.getContainers(container[property], targetName).forEach(obj => retVal.push(obj));
        }

        if (listElements) {
          (<Array<Object>> listElements).forEach(element => {
            this.getContainers(element, targetName).forEach(obj => retVal.push(obj));
          });
        }
      }
    }

    return retVal;
  }

  private flattenRules(definition: Untold.ClientInnerDefinition): Array<RuleDefinition> {
    let result: Array<RuleDefinition> = [];

    if (definition.definitions) {
      definition.definitions.forEach(def => result = [...result, ...this.flattenRules(def)]);
    }

    if (definition.rules) {
      const innerResult: Array<RuleDefinition> = definition.rules.map(rule => {
        return {
          rule: rule,
          definition: definition
        };
      });

      result = [...result, ...innerResult];
    }

    return result;
  }

  private ensureEntityStructure(entity: GenesisEntity) {
    if (!entity.definition.definitions || entity.definition.definitions.length === 0) {
      return;
    }

    entity.definition.definitions.forEach(def => {
      const exist = entity[<string> def.occurrenceGuid];

      if (!exist) {
        if (def.isList) {
          entity[<string> def.occurrenceGuid] = [];
        } else if (def.dataType === 'Definition') {
          entity[<string> def.occurrenceGuid] = {};
        } else {
          entity[<string> def.occurrenceGuid] = '';
        }
      } else {
        if (def.isList) {
          if (exist.length > 0) {
            (<Array<any>> exist).forEach(val => this.ensureEntityStructure({
              definition: def,
              entity: val
            }));
          }
        }
      }

      this.ensureEntityStructure({
        definition: def,
        entity: entity[<string> def.occurrenceGuid]
      });
    });
  }
}
