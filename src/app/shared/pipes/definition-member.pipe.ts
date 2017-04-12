import { Pipe, PipeTransform } from '@angular/core';

import { Untold } from '../../shared/models/backend-export';

@Pipe({
    name: 'filtersDefinitionMembers'
})
export class FiltersDefinitionMembersPipe implements PipeTransform {
    transform(definitions: Array<Untold.ClientInnerDefinition>,
              memberFilterText: string,
              showOwnMembers: boolean): Array<any> {
        return definitions.filter(def => {
            return (!memberFilterText || def.name.indexOf(memberFilterText) > -1) &&
                   def.inherited !== showOwnMembers;
        });
    }
}
