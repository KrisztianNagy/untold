import { Injectable } from '@angular/core';

import { Untold, System } from '../../../shared/models/backend-export';

@Injectable()
export class DefinitionEnhancerService {

  constructor() { }

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
}
