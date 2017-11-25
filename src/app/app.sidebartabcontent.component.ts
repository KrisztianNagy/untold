import {Component,AfterViewInit,ViewChild,OnDestroy,ElementRef} from '@angular/core';

declare var jQuery: any;

@Component({
    selector: 'app-sidebarTabContent',
    template: `
        <div class="layout-submenu-content" (click)="onClick($event)">
            <div #scroller class="nano">
                <div class="nano-content menu-scroll-content">
                    <ng-content></ng-content>
                </div>
            </div>
        </div>
    `
})
export class AppSidebarTabContent implements AfterViewInit,OnDestroy {
    
    @ViewChild('scroller') layoutMenuScrollerViewChild: ElementRef;
    
    scroller: HTMLDivElement;
    
    ngAfterViewInit() {
        this.scroller = <HTMLDivElement> this.layoutMenuScrollerViewChild.nativeElement;
        setTimeout(() => {
            jQuery(this.scroller).nanoScroller({flash:true});
        }, 10);
    }
    
    onClick($event) {
        setTimeout(() => {
            jQuery(this.scroller).nanoScroller();
        }, 500);
    }

    ngOnDestroy() {
        jQuery(this.scroller).nanoScroller({destroy:true});
    }
}