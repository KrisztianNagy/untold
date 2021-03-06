import { Untold } from '../../shared/models/backend-export';

export class AzureTableRow {
    PartitionKey: string;
    RowKey: string;
    rowStatus: number;
}

export class EntityTableRow extends AzureTableRow {
    entity: Object;
}

export class SheetTableRow extends AzureTableRow {
    json: string;
    scripts: string;
}

export class ChatTableRow extends AzureTableRow {
    message: string;
}

export class DataTable {
    oldColumns: Array<Untold.ClientRuleTableColumn>;
    columns: Array<Untold.ClientRuleTableColumn>;
    rows: Array<AzureTableRow>;
    readAccessSignature: string;
    editorAccessSignature: string;
    oldName: string;
    name: string;
    uniqueName: string;
}
