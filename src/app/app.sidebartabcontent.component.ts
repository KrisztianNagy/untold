import {Component, AfterViewInit, ViewChild, OnDestroy, ElementRef} from '@angular/core';
import {ScrollPanel} from 'primeng/primeng';


@Component({
    /* tslint:disable:component-selector */
    selector: 'app-sidebarTabContent',
    /* tslint:enable:component-selector */
    template: `
        <div class="layout-submenu-content" (click)="onClick($event)">
            <p-scrollPanel #scroller [style]="{height: '100%'}">
                <ng-content></ng-content>
            </p-scrollPanel>
        </div>
    `
})
export class AppSidebartabcontentComponent implements AfterViewInit {

    @ViewChild('scroller') layoutMenuScrollerViewChild: ScrollPanel;

    ngAfterViewInit() {
      setTimeout(() => {this.layoutMenuScrollerViewChild.moveBar(); }, 100);
    }

    onClick(event: Event) {
      setTimeout(() => {
        this.layoutMenuScrollerViewChild.moveBar();
      }, 450);
    }
}
