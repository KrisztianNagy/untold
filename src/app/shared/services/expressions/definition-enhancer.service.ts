import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

import { Untold, System } from '../../../shared/models/backend-export';
import { ExpressionTableCacheService } from '../../../shared/services/expressions/expression-table-cache.service';
import { RealmTableService } from '../../../store/services/realm-table.service';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
@Injectable()
export class DefinitionEnhancerService {
  private cachedChoices = {};

  constructor(private expressionTableCacheService: ExpressionTableCacheService,
              private realmTableService: RealmTableService,
              private realmDefinitionService: RealmDefinitionService) { }

  getParentChain(definitions: Array<Untold.ClientDefinition>, definitionGuid: System.Guid): Array<Untold.ClientDefinition> {
    const chain: Array<Untold.ClientDefinition> = [];

    while (true) {
      const matchingDefinitions = definitions.filter(def => def.definitionGuid === definitionGuid);

      if (matchingDefinitions.length) {
        const definition = matchingDefinitions[0];
        chain.push(definition);

        if (definition.parentDefinitionGuid) {
          definitionGuid = definition.parentDefinitionGuid;
        } else {
          break;
        }
      } else {
        break;
      }
    };

    return chain;
  }

  // tslint:disable-next-line:max-line-length
  findDefinitionContainerChain(rootDefinition: Untold.ClientInnerDefinition, targetDefinition: Untold.ClientInnerDefinition) : Array<Untold.ClientInnerDefinition> {
    if (!targetDefinition.occurrenceGuid) {
      return [targetDefinition];
    }

    for (let i = 0; i < rootDefinition.definitions.length; i++ ) {
      if (rootDefinition.definitions[i].occurrenceGuid === targetDefinition.occurrenceGuid) {
        return [rootDefinition, targetDefinition];
      }

      if (rootDefinition.definitions[i].definitions) {
        const checkBelow = this.findDefinitionContainerChain(rootDefinition.definitions[i], targetDefinition);
        if (checkBelow.length) {
          return[rootDefinition, ...checkBelow];
        }
      }
    }

    return [];
  }

  getAllChoiceOptions(definition: Untold.ClientInnerDefinition): AsyncSubject<object> {
    const subject = new AsyncSubject<object>();

    const filteredDefinitions = this.processDefinitionHierarchy(definition);
    const iteratorSubject = new Subject<number>();

    const iteratorSubscription = iteratorSubject.subscribe(position => {

      if (position < filteredDefinitions.length) {
        const currentDefinition = filteredDefinitions[position];
        const cacheKey = <string> currentDefinition.occurrenceGuid;
        if (!this.cachedChoices[cacheKey]) {
          if (currentDefinition.isCollectionChoice) {
            this.cachedChoices[cacheKey] = currentDefinition.collectionChoiceList;
            iteratorSubject.next(position + 1);
          } else {
            this.getTableChoiceList(currentDefinition).subscribe(choiceValues => {
              this.cachedChoices[cacheKey] = choiceValues;
              iteratorSubject.next(position + 1);
            }, err => {
              iteratorSubject.next(position + 1);
            });
          }
        } else {
          iteratorSubject.next(position + 1);
        }
      } else {
        iteratorSubscription.unsubscribe();
        subject.next(this.cachedChoices);
        subject.complete();
      }
    });

    iteratorSubject.next(0);
    return subject;
  }

  processDefinitionHierarchy(definition: Untold.ClientInnerDefinition): Array<Untold.ClientInnerDefinition> {
    let filteredDefinitions = [];

    if (definition.dataType === 'choice') {
      filteredDefinitions.push(definition);
    } else {
      if (definition.definitions && definition.definitions.length) {
        definition.definitions.forEach(def => {
          const addedDefinitions = this.processDefinitionHierarchy(def);
          filteredDefinitions = [...filteredDefinitions, ...addedDefinitions];
        });
      }
    }

    return filteredDefinitions;
  }

  getTableChoiceList (definition: Untold.ClientInnerDefinition): AsyncSubject<Array<string>> {
    const subject = new AsyncSubject<Array<string>>();

    const selectedModule = this.realmTableService.getCurrent().filter(module => module.guid === definition.choiceModule);

    if (selectedModule.length) {
      const selectedTable = selectedModule[0].tables.filter(table => table.tableGuid === definition.choiceTable);

      if (selectedTable.length) {
        this.expressionTableCacheService.getTableColumnValues(selectedTable[0].name, definition.choiceColumn, selectedModule[0].name)
          .subscribe(values => {
            subject.next(values);
            subject.complete();
        }, err => {
          subject.error(err);
        });
      } else {
        subject.next([]);
        subject.complete();
      }
    } else {
      subject.next([]);
      subject.complete();
    }

    return subject;
  }

  findDefinitionIfExist(definition: Untold.ClientDefinition, definitionGuid: string) {
    let pickedDefinition = definition;

    const modules = this.realmDefinitionService.getCurrent();
    modules.forEach(mod => {
        mod.definitions.forEach(def => {
            if (def.definitionGuid === definitionGuid) {
                pickedDefinition = def;
            }
        });
    });

    return pickedDefinition;
  }

  getInnerDefinition(definition: Untold.ClientInnerDefinition, occuranceGuid: string): Untold.ClientInnerDefinition {
    let found: Untold.ClientInnerDefinition = null;

    if (definition.occurrenceGuid === occuranceGuid) {
      return definition;
    }

    if (definition.definitions) {
      definition.definitions.forEach(def => {
        if (found) {
          return;
        }

        if (def.occurrenceGuid === occuranceGuid) {
          found = def;
          return;
        }
        const childCheck = this.getInnerDefinition(def, occuranceGuid);

        if (childCheck) {
          found = childCheck;
        }
      });
    }

    return found;
  }
}
