import { Pipe, PipeTransform } from '@angular/core';

import { Untold } from '../../shared/models/backend-export';

@Pipe({
    name: 'filtersRuleTableColumns'
})
export class FiltersRuleTableColumnsPipe implements PipeTransform {
    transform(columns: Array<Untold.ClientRuleTableColumn>): Array<any> {
        return columns.filter(col => !col.deleted);
    }
}
