import { Injectable } from '@angular/core';

import { SheetElement, SheetElementOperation, OccuranceChainElement} from '../../models/sheet-element';
import { DefinitionEnhancerService } from './definition-enhancer.service';
import { Untold } from '../../models/backend-export';

@Injectable()
export class SheetBuilderService {

  constructor(private definitionEnhancerService: DefinitionEnhancerService) { }

  addGrid(rootElement: SheetElement, selectedElement: SheetElement, operation: string, numerator: number, denominator: number) {
    const maxId = this.getMaxId(rootElement);

    const element: SheetElement = {
      type: 'grid',
      id: maxId + 1,
      numerator: numerator,
      denominator: denominator,
      innerElements: [],
      parentId: selectedElement.id,
      parentScope: 0
    };

    const rebuiltRootElement = this.rebuildRecursively(rootElement, { action: operation, subject: element, targetId: selectedElement.id});
    return rebuiltRootElement;
  }

  addTextControl(rootElement: SheetElement, selectedElement: SheetElement) {
    const maxId = this.getMaxId(rootElement);

      const element: SheetElement = {
        type: 'text',
        id: maxId + 1,
        content: '',
        innerElements: [],
        parentId: selectedElement.id,
        parentScope: 0
      };

      const rebuiltRootElement = this.rebuildRecursively(rootElement, { action: 'add', subject: element, targetId: selectedElement.id});
      return rebuiltRootElement;
  }

  addPropertyControl(rootElement: SheetElement, selectedElement: SheetElement) {
    const maxId = this.getMaxId(rootElement);

    const element: SheetElement = {
      type: 'property',
      id: maxId + 1,
      content: '',
      innerElements: [],
      parentId: selectedElement.id,
      parentScope: 0
    };

    const rebuiltRootElement =  this.rebuildRecursively(rootElement, { action: 'add', subject: element, targetId: selectedElement.id});
    return rebuiltRootElement;
  }

  addRepeater(rootElement: SheetElement, selectedElement: SheetElement) {
    const maxId = this.getMaxId(rootElement);

    const element: SheetElement = {
      type: 'repeater',
      id: maxId + 1,
      content: '',
      innerElements: [],
      parentId: selectedElement.id,
      parentScope: 0
    };

    const rebuiltRootElement = this.rebuildRecursively(rootElement, { action: 'add', subject: element, targetId: selectedElement.id});
    return rebuiltRootElement;
  }

  addButton(rootElement: SheetElement, selectedElement: SheetElement) {
    const maxId = this.getMaxId(rootElement);

    const element: SheetElement = {
      type: 'button',
      id: maxId + 1,
      content: '',
      innerElements: [],
      parentId: selectedElement.id,
      parentScope: 0
    };

    const rebuiltRootElement = this.rebuildRecursively(rootElement, { action: 'add', subject: element, targetId: selectedElement.id});
    return rebuiltRootElement;
  }

  deleteElement(rootElement: SheetElement, selectedElement: SheetElement) {
    const rebuiltRootElement = this.rebuildRecursively(rootElement, {action: 'delete', subject: null, targetId: selectedElement.id});
    return rebuiltRootElement;
  }

  getMaxId(rootElement: SheetElement, currentMaxId: number = 0): number {
    currentMaxId = rootElement.id > currentMaxId ? rootElement.id : currentMaxId;

    rootElement.innerElements.forEach(child => {
      currentMaxId = this.getMaxId(child, currentMaxId);
    });

    return currentMaxId;
  }

  rebuildRecursively(element: SheetElement, operation: SheetElementOperation): SheetElement {
    if (operation.action === 'delete' && operation.targetId === element.id) {
      return null;
    }

    let cloned: SheetElement = JSON.parse(JSON.stringify(element));

    if (operation.action === 'update' && operation.targetId === element.id) {
      cloned = JSON.parse(JSON.stringify(operation.subject));
    }

    cloned.innerElements =  [] ;
    element.innerElements.forEach(child =>  {

      if (operation.action === 'addbefore' && operation.targetId === child.id) {
        cloned.innerElements.push(operation.subject);
      }

      const result = this.rebuildRecursively(child, operation);

      if (result) {
        cloned.innerElements.push(result);
      }

      if (operation.action === 'addafter' && operation.targetId === child.id) {
        cloned.innerElements.push(operation.subject);
      }
    });

    if (operation.action === 'add' && operation.targetId === element.id) {
      cloned.innerElements.push(operation.subject);
    }

    return cloned;
  }

  getParentChain(rootElement: SheetElement, id: number): SheetElement[] {

    let chain: SheetElement[];
    let findId = id;

    while (true) {
      const found = this.findById(rootElement, findId);

      if (found) {
        chain = [found, ...chain];

        if (found.parentId) {
          findId = found.parentId;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return chain;
  }

  findById(rootElement: SheetElement, id: number): SheetElement {
    if (rootElement.id === id) {
      return rootElement;
    }

    for (let i = 0; i < rootElement.innerElements.length; i++) {
      const found = this.findById(rootElement.innerElements[i], id);

      if (found) {
        return found;
      }
    }

    return null;
  }

  getValidOccuranceGuids(rootElement: SheetElement, targetElement: SheetElement) {
    let guids: Array<Array<string>> = null;

    rootElement.innerElements.forEach(element => {
      guids = this.getValidOccuranceGuids(element, targetElement);
    });

    if (guids && rootElement.definitionOccurenceGuidChain) {
      guids.push(rootElement.definitionOccurenceGuidChain.map(el => el.occuranceGuid));
    }

    if (targetElement.id === rootElement.id) {
      return targetElement.definitionOccurenceGuidChain ? [targetElement.definitionOccurenceGuidChain.map(el => el.occuranceGuid)] : [];
    } else {
      if (guids && rootElement.definitionOccurenceGuidChain) {
          guids.push(rootElement.definitionOccurenceGuidChain.map(el => el.occuranceGuid));
      }
    }

    return guids;
  }

  getElementScopes(rootElement: SheetElement, targetElement: SheetElement) {
    let scopes: Array<Array<OccuranceChainElement>> = [];

    if (targetElement.parentScope) {
      const found = this.findById(rootElement, targetElement.parentScope);

      if (found) {
        scopes = [found.definitionOccurenceGuidChain];
        scopes = [...this.getElementScopes(rootElement, found), ...scopes];
      }
    }
    return scopes;
  }

  getInnerDefinitionFromScope(definition: Untold.ClientInnerDefinition, occuranceChainElements: OccuranceChainElement[]) {
    const guids = occuranceChainElements
      .filter(element => element.occuranceGuid)
      .map(element => element.occuranceGuid);

    return this.definitionEnhancerService.getInnerDefinition(definition, guids);
  }

}
