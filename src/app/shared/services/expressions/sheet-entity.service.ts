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
                const simpleEntity = {};

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
                const simpleEntity = [];
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
            const simpleEntity = {};
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
                const entityObject = [];
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
                const entityObject = [];
                const listElements: Array<any> = entity.entity.listElements;
                entityValue.listElements = [];

                if (simpleObject && simpleObject.length > 0) {
                    const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                    childDef.isList = false;

                    simpleObject.forEach((element, index) => {
                        const nextEntity: GenesisEntity = {
                            definition: childDef,
                            entity: (listElements && listElements.length > index) ? listElements[index] : {}
                        };

                        entityValue.listElements.push(this.getEntityFromSimpleEntity(nextEntity, element));
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
