import {System, Untold} from '../../shared/models/backend-export';
import { SheetElement } from '../../shared/models/sheet-element';

export class Sheet implements Untold.ClientSheet {
    definition: Untold.ClientDefinition;
    definitionGuid: System.Guid;
    id: number;
    moduleGuid: System.Guid;
    name: string;
    json: Array<SheetTab>;
    scripts: Array<SheetScript>;
}

export class SheetScript {
    name: string;
    script: string;
}

export class SheetTab {
    name: string;
    sheet: SheetElement;
}
