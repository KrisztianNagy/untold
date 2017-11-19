export class SheetElement {
    id: number;
    type: string;
    innerElements?: Array<SheetElement>;
    content?: string;
    definitionOccurenceGuid?: string;
    parentDefinitionOccuranceGuid: string;
    elementClass?: string;
    numerator?: number;
    denominator?: number;
    inputType?: string;
    mapping?: string;
    isList?: boolean;
    propertyType?: string;
    chat?: string;
}

export class SheetElementOperation {
    subject: SheetElement;
    action: string;
    targetId: number;
}

