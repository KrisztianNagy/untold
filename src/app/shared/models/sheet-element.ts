import { Untold } from '../models/backend-export';

export class   SheetElement {
    id: number;
    type: string;
    innerElements?: Array<SheetElement>;
    content?: string;
    definitionOccurenceGuidChain?: OccuranceChainElement[];
    parentId: number;
    elementClass?: string;
    numerator?: number;
    denominator?: number;
    inputType?: string;
    mapping?: string;
    propertyType?: string;
    chat?: string;
    listElementLabelResolve?: string;
    parentScope: number;
}

export class OccuranceChainElement {
    occuranceGuid: string;
    listElementName?: string;
}

export class SheetElementOperation {
    subject: SheetElement;
    action: string;
    targetId: number;
}

export class SheetProcessingParameters {
    sheetElement: SheetElement;
    definitions: Untold.ClientInnerDefinition[];
    modelMapping: string;
    sheetModels: SheetModel[];
}

export class SheetModel {
    name: string;
    definition: Untold.ClientInnerDefinition;
}



