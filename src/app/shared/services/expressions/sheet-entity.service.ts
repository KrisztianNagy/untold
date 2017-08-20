import { Injectable } from '@angular/core';

import { GenesisEntity } from '../../models/genesis-entity';
import { Untold } from '../../../shared/models/backend-export';

@Injectable()
export class SheetEntityService {

  constructor() { }

  getSimpleEntityFromGenesisEntity(entity: GenesisEntity): any {
    entity.entity = entity.entity || {};

        if (entity.definition.isList) {
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

}
