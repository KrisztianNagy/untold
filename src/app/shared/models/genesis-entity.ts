import { Untold } from '../models/backend-export';
import { TreeNode } from 'primeng/primeng';

export class GenesisEntity {
    entity: GenesisEntityValue;
    definition: Untold.ClientInnerDefinition;
}
export class GenesisEntityValue extends Object {
    listElements?: Array<GenesisEntityValue>;
}

export interface GenesisTreeNode extends TreeNode {
    data: GenesisTreeNodeData;
}

export interface GenesisTreeNodeData extends Untold.ClientInnerDefinition {
    temp?: GenesisEntityValue | string | number;
}
