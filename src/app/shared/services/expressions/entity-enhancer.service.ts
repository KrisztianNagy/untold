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
import { GenesisEntity, GenesisEntityValue } from '../../models/genesis-entity';
import { CalculatedExpressionService } from './calculated-expression.service';
import { ExpressionEvaluatorService } from './expression-evaluator.service';
declare var LZString;

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
          entity.definition = <Untold.ClientInnerDefinition>def;
          return;
        }
      });
    });

    this.ensureEntityStructure(entity.entity, entity.definition);
  }

  getGenesisEntity(entity: Untold.ClientEntity): AsyncSubject<GenesisEntity> {
    const subject = new AsyncSubject<GenesisEntity>();

    const modules = this.realmDefinitionService.getCurrent();

    modules.forEach(mod => {
      mod.definitions.forEach(def => {
        if (def.definitionGuid === entity.definitionGuid) {
          subject.next({
            entity: entity.entity,
            definition: <Untold.ClientInnerDefinition>def
          });
          subject.complete();
        }
      });
    });

    return subject;
  }

  saveEntity(entity: Untold.ClientEntity, realm: Untold.ClientRealm): Observable<Response> {
    const rawEntity = JSON.stringify(entity.entity);
    const codedEntity = LZString.compressToUTF16(rawEntity);

    const tableRow: EntityTableRow = {
      PartitionKey: 'entity',
      RowKey: entity.id.toString(),
      rowStatus: 1,
      entity: codedEntity
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Entities', realm.entityEditorAcccessSignature);
  }

  deleteEntity(entity: Untold.ClientEntity, realm: Untold.ClientRealm): Observable<Response> {
    const tableRow: EntityTableRow = {
      PartitionKey: 'entity',
      RowKey: entity.id.toString(),
      rowStatus: 1,
      entity: JSON.stringify(entity.entity)
    };

    return this.storageDataService.delete(tableRow, 'RM' + realm.id + 'Entities', realm.entityEditorAcccessSignature);
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
        const loadedEntity: Untold.ClientEntity = JSON.parse(JSON.stringify(entity));
        loadedEntity.entity = {};

        const storageEntity = JSON.parse(res);

        if (storageEntity && storageEntity['entity']) {
          const decompressed = LZString.decompressFromUTF16(storageEntity['entity']);
          const parsed = JSON.parse(decompressed);
          loadedEntity.entity = parsed;
        }

        subject.next(loadedEntity);
        subject.complete();
      }, err => {
        const loadedEntity: Untold.ClientEntity = JSON.parse(JSON.stringify(entity));
        loadedEntity.entity = {};

        subject.next(loadedEntity);
        subject.complete();
      });

    return subject;
  }

  recalculate(entity: Untold.ClientEntity): AsyncSubject<Untold.ClientEntity> {
    const recalculateSubject = new AsyncSubject<Untold.ClientEntity>();

    entity = JSON.parse(JSON.stringify(entity));
    const calcFunctions = [];
    const rules = this.flattenRules(<Untold.ClientInnerDefinition>entity.definition);

    if (rules.length) {
      const rulesSubject = new Subject<number>();

      rulesSubject.subscribe(pos => {
        const rule = rules[pos];

        this.recalculateRule(entity.entity, rule).subscribe(() => {
          if (pos < rules.length - 1) {
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

  private recalculateRule(entity: any, rule: RuleDefinition): AsyncSubject<boolean> {
    const subject = new AsyncSubject<boolean>();

    const ruleScopes = this.getContainers(entity, <string>rule.rule.target)
      .map(obj => {
        return {
          entity: obj,
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
        // const targetContainer = this.getContainers(scope.entity, <string> rule.rule.target);

        // if (targetContainer && targetContainer.length > 0) {
        this.calculatedExpressionService.resolveNode(tree.tree, <any>scope.definition);
        this.expressionEvaluatorService.processExpression(tree.tree, scope)
          .subscribe(val => {
            scope.entity[<string>rule.rule.target] = val;
            subject.next(true);
            subject.complete();
          }, err => {
            subject.next(false);
            subject.complete();
          });
        /*} else {
          subject.next(false);
          subject.complete();
        }*/
      });
    } else {
      subject.next(false);
      subject.complete();
    }

    return subject;
  }

  private getContainers(container: Object, targetName: string): Array<Object> {

    const retVal: Array<Object> = [];

    for (const propertyName in container) {
      if (container.hasOwnProperty(propertyName)) {

        if (propertyName === targetName) {
          retVal.push(container);
        }

        const property = container[propertyName];
        const isObject = typeof (property) === 'object';
        const listElements = property ? property['listElements'] : null;

        if (isObject && !listElements) {
          this.getContainers(container[propertyName], targetName).forEach(obj => retVal.push(obj));
        }

        if (listElements) {
          (<Array<Object>>listElements).forEach(element => {
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

  private ensureEntityStructure(targetEntity: any, definition: Untold.ClientDefinition) {
    if (!definition.definitions || definition.definitions.length === 0) {
      return;
    }

    definition.definitions.forEach(def => {
      const existingObject: GenesisEntityValue = targetEntity[<string>def.occurrenceGuid];
      const exist = typeof existingObject !== 'undefined';

      if (!exist) {
        if (def.isList) {
          targetEntity[<string>def.occurrenceGuid] = { listElements: [] };

          if (def.isPredefinedList && def.predefinedListItems) {
            const inner = {};
            this.ensureEntityStructure(inner, def);

            def.predefinedListItems.forEach(item => {
              targetEntity[<string>def.occurrenceGuid].listElements.push(JSON.parse(JSON.stringify(inner)));
            });
          }
        } else if (def.dataType === 'Definition') {
          targetEntity[<string>def.occurrenceGuid] = {};
          this.ensureEntityStructure(targetEntity[<string>def.occurrenceGuid], def);
        } else {
          targetEntity[<string>def.occurrenceGuid] = '';
        }
      } else {
        if (def.isList) {
          existingObject.listElements = existingObject.listElements || [];
          if (def.isPredefinedList) {
            if (def.predefinedListItems && def.predefinedListItems.length) {
              if (existingObject.listElements.length > def.predefinedListItems.length) {
                existingObject.listElements = existingObject.listElements.slice(0, def.predefinedListItems.length);
              } else if (existingObject.listElements.length < def.predefinedListItems.length) {
                for (let i = 0; i < def.predefinedListItems.length - existingObject.listElements.length; i++) {
                  existingObject.listElements.push({});
                }
              }

              existingObject.listElements.forEach(val => this.ensureEntityStructure(val, def));
            } else {
              existingObject.listElements = [];
            }
          } else {
            if (existingObject.listElements.length > 0) {
              existingObject.listElements.forEach(val => this.ensureEntityStructure(val, def));
            }
          }
        } else if (def.dataType === 'Definition') {
          this.ensureEntityStructure(targetEntity[<string>def.occurrenceGuid], def);
        }
      }
    });

    for (const key of Object.keys(targetEntity)) {
      const foundInDefinition = definition.definitions.some(def => def.occurrenceGuid === key);

      if (!foundInDefinition) {
        delete targetEntity[key];
      }
    }
  }
}
