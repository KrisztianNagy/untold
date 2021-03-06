import { Component, OnInit, Input, Output, EventEmitter,
         ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

import { TreeNode } from 'primeng/primeng';
import { SelectItem } from 'primeng/primeng';

import { TreeNodeService } from '../../../shared/services/tree-node.service';
import { GenesisEntity, GenesisTreeNode } from '../../../shared/models/genesis-entity';
import { Untold } from '../../../shared/models/backend-export';

@Component({
  selector: 'app-entity-editor',
  templateUrl: './entity-editor.component.html',
  styleUrls: ['./entity-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityEditorComponent implements OnInit, OnChanges {
  @Input() testMode: boolean;
  @Input() entity: GenesisEntity;
  @Input() choiceOptions: any;
  @Output() entityChanged = new EventEmitter<GenesisEntity>();
  tree: TreeNode[];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private treeNodeService: TreeNodeService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName === 'entity') {
        const chng = changes[propName];
        const cur: GenesisEntity  = chng.currentValue ;
        const prev: GenesisEntity = chng.previousValue;

        const nextTree = [this.treeNodeService.getTreeFromGenesisEntity(cur)];

        if (this.tree) {
          this.treeNodeService.keepNodesExpanded(this.tree[0], nextTree[0]);
        }

        this.tree = nextTree;
      }
    }
  }

  updateEntity() {
    this.entity.entity = this.treeNodeService.getGenesisEntityFromDefinitionTree(<GenesisTreeNode> this.tree[0]);
    this.entityChanged.emit(this.entity);
  }

  addChild(selectedNode: GenesisTreeNode) {
    const updatedTree = this.treeNodeService.addListItemToTreeNode(selectedNode);
    selectedNode.children = updatedTree.children;
    selectedNode = null;
  }

  remove(selectedNode: GenesisTreeNode) {
    selectedNode.parent.children = this.treeNodeService.removeListItemFromTreeNode(selectedNode.parent, selectedNode);
    selectedNode = null;
  }

  getOptions(occurenceGuid: string): Array<SelectItem> {
    if (this.choiceOptions[occurenceGuid]) {
      const selectedOptions = this.choiceOptions[occurenceGuid].map(op => {
        return {
         label: op,
         value: op
       };
     });

     return selectedOptions;
    }

    return [];
  }
}
