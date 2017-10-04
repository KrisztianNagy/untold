import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { Untold } from '../../shared/models/backend-export';
import { GenesisEntity, GenesisEntityValue, GenesisTreeNode } from '../../shared/models/genesis-entity';

@Injectable()
export class TreeNodeService {

  constructor() {

  }

  getOrganizationChartFromDefinitions(definition: Untold.ClientDefinition) {
    const organizationTree =  [{
        label: definition.name,
        data: definition,
        expanded: true,
        type: 'definition',
      }];

      this.updateTreeLayerFromDefinitions(organizationTree[0], definition.definitions);
      return organizationTree;
  }

  updateTreeLayerFromDefinitions(parentNode: TreeNode, definitions: Array<Untold.ClientDefinition>) {
    parentNode.children = [];

    definitions.forEach(definition => {
        const hasChildren = definitions.filter(def => {
            return def.parentDefinitionGuid && def.definitionGuid && def.parentDefinitionGuid === definition.definitionGuid;
        }).length > 0;

        const node: TreeNode = {
            label: definition.name,
            data: definition,
            expanded: true,
            type: 'definition',
            'leaf': !hasChildren,
            'expandedIcon': 'ui-icon-folder-open',
            'collapsedIcon': 'ui-icon-folder',
            parent: parentNode
        };

        if (definition.definitions && definition.definitions) {
            this.updateTreeLayerFromDefinitions(node, definition.definitions);
        }

        parentNode.children.push(node);
    });
  }

  getDefinitionMemberTree(definition: Untold.ClientInnerDefinition): TreeNode {
    const tree: TreeNode = {};
    // tree.children = [];
    tree.label = definition.name;
    tree.data = definition;

    if (definition.definitions) {
        tree.children = definition.definitions
            .map(def => this.getDefinitionMemberTree(def));
    }

    return tree;
  }

  getEmptyGenesisEntityFromDefinitionTree(tree: GenesisTreeNode): GenesisEntityValue {
      let entity: GenesisEntityValue = {};

      if (tree.data.isList) {
          entity.listElements = [];

          if (tree.data.isPredefinedList && tree.data.predefinedListItems.length && tree.children) {
              console.log('definition tree');
                const temp = {};

                tree.children.forEach( child => {
                    const data: Untold.ClientInnerDefinition = child.data;
                    temp[<string> data.occurrenceGuid] = this.getEmptyGenesisEntityFromDefinitionTree(<GenesisTreeNode>child);
                });

                entity.listElements = tree.data.predefinedListItems.map(item => JSON.parse(JSON.stringify(temp)));
          }
      } else if (tree.children) {
        tree.children.forEach( child => {
            const data: Untold.ClientInnerDefinition = child.data;

            entity[<string> data.occurrenceGuid] = this.getEmptyGenesisEntityFromDefinitionTree(<GenesisTreeNode>child);
        });
    } else if (tree.data.dataType !== 'Definition') {
            entity = tree.data.temp ? tree.data.temp : null;
      }

      return entity;
  }

  getTreeFromGenesisEntity(entity: GenesisEntity, customLabel?: string): GenesisTreeNode {
    entity.entity = entity.entity || {};

    const tree: GenesisTreeNode = {
        data: JSON.parse(JSON.stringify(entity.definition)),
        children: null,
        label : customLabel || entity.definition.name
    };

    if (entity.definition.isList) {
        tree.expandedIcon = 'ui-icon-list';
        tree.collapsedIcon = 'ui-icon-list';
        tree.children = [];
        const listElements: Array<any> = entity.entity.listElements;

        if (entity.definition.isPredefinedList) {

            const predefinedListItems = entity.definition.predefinedListItems ? entity.definition.predefinedListItems : [];
            const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
            childDef.isList = false;

            predefinedListItems.forEach((element, index) => {
                if (listElements && listElements.length > index) {
                    const nextEntity: GenesisEntity = {
                        definition: childDef,
                        entity: listElements[index]
                    };

                    tree.children.push(this.getTreeFromGenesisEntity(nextEntity, element));
                }
            });
        } else {
            if (listElements && listElements.length > 0) {
                const childDef: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(entity.definition));
                childDef.isList = false;

                listElements.forEach((element, index) => {
                    const nextEntity: GenesisEntity = {
                        definition: childDef,
                        entity: element
                    };

                    tree.children.push(this.getTreeFromGenesisEntity(nextEntity));
                });
            }
        }
    } else if (entity.definition.definitions) {
        tree.expandedIcon = 'ui-icon-layers';
        tree.collapsedIcon = 'ui-icon-layers';

        tree.children = [];

        entity.definition.definitions.forEach(def => {
            const nextEntity: GenesisEntity = {
                definition: def,
                entity: entity.entity[<string> def.occurrenceGuid]
            };

            tree.children.push(this.getTreeFromGenesisEntity(nextEntity));
        });
    } else {
        switch (entity.definition.dataType) {
            case 'number':
                tree.expandedIcon = 'ui-icon-exposure-zero';
                tree.collapsedIcon = 'ui-icon-exposure-zero';
                tree.data.temp = entity.entity;
            break;
            case 'text':
                tree.expandedIcon = 'ui-icon-text-format';
                tree.collapsedIcon = 'ui-icon-text-format';
                tree.data.temp = typeof entity.entity === 'string' ? entity.entity : '';
            break;
            case 'choice':
                tree.expandedIcon = 'ui-icon-arrow-drop-down';
                tree.collapsedIcon = 'ui-icon-arrow-drop-down';
                tree.data.temp = typeof entity.entity === 'string' ? entity.entity : '';
            break;
            case 'bool':
                tree.expandedIcon = 'ui-icon-check-box-outline-blank';
                tree.collapsedIcon = 'ui-icon-check-box-outline-blank';
                tree.data.temp = typeof entity.entity === 'boolean' ? entity.entity : false;
            break;
            default:
                tree.expandedIcon = 'ui-icon-layers';
                tree.collapsedIcon = 'ui-icon-layers';
        }
    }

    return tree;
  }

  getGenesisEntityFromDefinitionTree(tree: GenesisTreeNode): GenesisEntityValue {
    let entity: GenesisEntityValue = {};

    if (tree.data.isList) {
        entity.listElements = [];

        if (tree.children) {
            tree.children.forEach((child: GenesisTreeNode, index) => {
                const data: Untold.ClientInnerDefinition = child.data;

                entity.listElements.push( this.getGenesisEntityFromDefinitionTree(child));
            });
        }
    } else {
        if (tree.children) {
            tree.children.forEach((child: GenesisTreeNode) => {
                const data: Untold.ClientInnerDefinition = child.data;

                entity[<string> data.occurrenceGuid] = this.getGenesisEntityFromDefinitionTree(child);
            });
        } else if (tree.data.dataType !== 'Definition') {
            entity = tree.data.temp ? tree.data.temp : null;
        }
    }

    return entity;
  }

  addListItemToTreeNode(tree: GenesisTreeNode): GenesisTreeNode {
    if (tree.data.isList) {
        const def: Untold.ClientInnerDefinition = JSON.parse(JSON.stringify(tree.data));
        def.isList = false;

        const childTree = this.getTreeFromGenesisEntity({
            definition: def,
            entity: {}
        });

        childTree.data.temp = {};

        tree.children.push(childTree);

        tree.children.forEach((child, index) => {
            child.label = '[' + index + ']';
        });
    }

    return tree;
  }

  removeListItemFromTreeNode(parentTree: TreeNode, childTree: TreeNode): Array<TreeNode> {
     if (parentTree.data.isList) {
         return parentTree.children.filter(child => child !== childTree);
     }

     return parentTree.children;
  }

  getValidMembersFrom(definition: Untold.ClientDefinition,
                  definitions: Array<Untold.ClientDefinition>): Array<Untold.ClientDefinition> {
      const invalidDefinitions: Array<Untold.ClientDefinition> = [];
      let validDefinitions: Array<Untold.ClientDefinition> = [];

      invalidDefinitions.push(definition);

      definitions.forEach(def => {
          const valid = this.assertRecursiveCircularDependency(definition, def, definitions, validDefinitions, invalidDefinitions, 0);
          console.log ('Running ' + def.name + ', result: ' + (valid ?  valid.length + ' valid items' : 'Not valid'));

          if (valid) {
              validDefinitions = [...validDefinitions, ...valid];
          } else {
              validDefinitions = validDefinitions.filter(val => {
                  return invalidDefinitions.filter(inv => {
                      return val.definitionGuid === inv.definitionGuid;
                  }).length === 0;
              });
          }
      });

      return validDefinitions;
  }

  keepNodesExpanded(previous: TreeNode, next: TreeNode) {
    try {
        if (previous.expanded) {
            next.expanded = true;
        }

        if (previous.children) {
            previous.children.forEach((item, index) => {
                this.keepNodesExpanded(previous.children[index], next.children[index]);
            });
        }
    } catch (ex) {

    }
  }

  private assertRecursiveCircularDependency(originalDefinition: Untold.ClientDefinition,
                                            targetDefinition: Untold.ClientDefinition,
                                            allDefinitions: Array<Untold.ClientDefinition>,
                                            validDefinitions: Array<Untold.ClientDefinition>,
                                            invalidDefinitions: Array<Untold.ClientDefinition>,
                                            depth: number): Array<Untold.ClientDefinition> {
    depth++;
    let processedDefinitions: Array<Untold.ClientDefinition> = [];

    const reachedInvalid =  invalidDefinitions.filter( def => {
        return def.definitionGuid === targetDefinition.definitionGuid;
    }).length > 0;

    if (reachedInvalid) {
        return null; // This branch has been failed in a previous run.
    }

    const reachedValid =  validDefinitions.filter( def => {
        return def.definitionGuid === targetDefinition.definitionGuid;
    }).length > 0;

    if (reachedValid) {
        return []; // This branch has been succesful in a previous run.
    }

    if (targetDefinition.parentDefinitionGuid) {
        const parentDefinition = allDefinitions.filter( def => {
            return def.definitionGuid === targetDefinition.parentDefinitionGuid;
        });

        if (parentDefinition.length > 0) {
            const result = this.assertRecursiveCircularDependency(originalDefinition,
                                                   parentDefinition[0],
                                                   allDefinitions,
                                                   validDefinitions,
                                                   invalidDefinitions,
                                                   depth);

            if (result) {
                processedDefinitions = result;
            } else {
                invalidDefinitions.push(targetDefinition);
                return null;
            }
        }
    }

    if (targetDefinition.definitions) {
        targetDefinition.definitions.forEach(def => {
            const result = this.assertRecursiveCircularDependency(originalDefinition,
                                                   def,
                                                   allDefinitions,
                                                   validDefinitions,
                                                   invalidDefinitions,
                                                   depth);
            if (result) {
                processedDefinitions = [...processedDefinitions, ...result];
            } else {
                invalidDefinitions.push(targetDefinition);
                return null;
            }
        });
    }

    if (!targetDefinition.hasOwnProperty('isList')) {
        processedDefinitions.push(targetDefinition);
    }

    return processedDefinitions;
  }
}
