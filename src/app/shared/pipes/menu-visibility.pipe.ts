import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterMenu'
})
export class MenuVisibilityPipe implements PipeTransform {
    transform(menuItems: Array<any>): Array<any> {
        return menuItems.filter(item => item.visible !== false);
    };
}
