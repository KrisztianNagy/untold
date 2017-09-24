import { Injectable } from '@angular/core';

import { GenesisEntity, GenesisEntityValue } from '../../models/genesis-entity';
import { Untold } from '../../../shared/models/backend-export';

@Injectable()
export class SheetEntityService {

  constructor() { }

  getSimpleEntityFromGenesisEntity(entity: GenesisEntity): any {
    entity.entity = entity.entity || {};

        if (entity.definition.isList) {

            if (entity.definition.isPredefinedList) {
                let simpleEntity = {};

                if (entity.definition.isPredefinedList && entity.definition.predefinedListItems) {
                    const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                    childDef.isList = false;

                    entity.definition.predefinedListItems.forEach((element, index) => {
                        const connectedElement = entity.entity.listElements[index];
                        const nextEntity: GenesisEntity = {
                            definition: childDef,
                            entity: connectedElement
                        };

                        simpleEntity[element] = this.getSimpleEntityFromGenesisEntity(nextEntity);
                    });
                }

                return simpleEntity;
            } else {
                let simpleEntity = [];
                const listElements: Array<any> = entity.entity.listElements;

                if (listElements && listElements.length > 0) {
                    const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                    childDef.isList = false;

                    listElements.forEach(element => {
                        const nextEntity: GenesisEntity = {
                            definition: childDef,
                            entity: element
                        };

                        simpleEntity.push(this.getSimpleEntityFromGenesisEntity(nextEntity));
                    });
                }

                return simpleEntity;
                }
        } else if (entity.definition.definitions) {
          let simpleEntity = {};
          entity.definition.definitions.forEach(def => {
                const nextEntity: GenesisEntity = {
                    definition: def,
                    entity: entity.entity[<string> def.occurrenceGuid]
                };

                simpleEntity[def.name] = this.getSimpleEntityFromGenesisEntity(nextEntity);
            });

            return simpleEntity;
        } else {
            switch (entity.definition.dataType) {
                case 'number':
                  return (typeof entity.entity === 'string' || typeof entity.entity === 'number') ? entity.entity : 0;
                case 'text':
                  return typeof entity.entity === 'string' ? entity.entity : '';
                case 'bool':
                  return typeof entity.entity === 'boolean' ? entity.entity : false;
                default:
                return null;
            }
        }
  }

  getEntityFromSimpleEntity(entity: GenesisEntity, simpleObject: any): GenesisEntityValue {
    let entityValue: GenesisEntityValue = {};

        if (entity.definition.isList) {

            if (entity.definition.isPredefinedList) {
                let entityObject = [];
                const listElements: Array<any> = entity.entity.listElements;
                entityValue.listElements = [];

                if (entity.definition.predefinedListItems && entity.definition.predefinedListItems.length > 0) {
                    const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                    childDef.isList = false;

                    entity.definition.predefinedListItems.forEach((element, index) => {
                        const nextEntity: GenesisEntity = {
                            definition: childDef,
                            entity: entity.entity.listElements[index]
                        };

                        entityValue.listElements.push(this.getEntityFromSimpleEntity(nextEntity, simpleObject[element]));
                    });
                }
            } else {
                let entityObject = [];
                const listElements: Array<any> = entity.entity.listElements;
                entityValue.listElements = [];

                if (listElements && listElements.length > 0) {
                    const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                    childDef.isList = false;

                    listElements.forEach((element, index) => {
                        const nextEntity: GenesisEntity = {
                            definition: childDef,
                            entity: element
                        };

                        entityValue.listElements.push(this.getEntityFromSimpleEntity(nextEntity, simpleObject[index]));
                    });
                }
            }
        } else if (entity.definition.definitions) {
            entity.definition.definitions.forEach(def => {
                const nextEntity: GenesisEntity = {
                    definition: def,
                    entity: entity.entity[<string> def.occurrenceGuid]
                };

                entityValue[<string> def.occurrenceGuid] = this.getEntityFromSimpleEntity(nextEntity, simpleObject[def.name]);
            });
        } else {
            entityValue = simpleObject;
        }

    return entityValue;
  }

}
