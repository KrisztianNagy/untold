import {System, Untold} from '../../shared/models/backend-export';

export class Sheet implements Untold.ClientSheet {
    definition: Untold.ClientDefinition;
    definitionGuid: System.Guid;
    id: number;
    moduleGuid: System.Guid;
    name: string;
    html: string;
    css: string;
    scripts: Array<SheetScript>;
}

export class SheetScript {
    name: string;
    script: string;
}
