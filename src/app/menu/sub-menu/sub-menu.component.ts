import {Component,Input,OnInit,EventEmitter,ViewChild,trigger,state,transition,style,animate,Inject,forwardRef} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {AppComponent} from '../../app.component';

@Component({
  selector: '[app2-submenu]', 
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css'],
  animations: [ 
      trigger('children', [
          state('hidden', style({
              height: '0px'
          })),
          state('visible', style({
              height: '*'
          })),
          transition('visible => hidden', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')),
          transition('hidden => visible', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
      ])
  ]
})
export class SubMenuComponent implements OnInit {
  @Input() item: MenuItem;    
  @Input() root: boolean;
  @Input() visible: boolean;

  _reset: boolean;    
  activeIndex: number;

  constructor(@Inject(forwardRef(() => AppComponent)) public app:AppComponent, public router: Router, public location: Location) {}

  ngOnInit() {

  }

  itemClick(event: Event, item: MenuItem, index: number) {
      //avoid processing disabled items
      if(item.disabled) {
          event.preventDefault();
          return true;
      }
      
      //activate current item and deactivate active sibling if any
      this.activeIndex = (this.activeIndex === index) ? null : index;
              
      //execute command
      if(item.command) {
          if(!item.eventEmitter) {
              item.eventEmitter = new EventEmitter();
              item.eventEmitter.subscribe(item.command);
          }
          
          item.eventEmitter.emit({
              originalEvent: event,
              item: item
          });
      }

      //prevent hash change
      if(item.items || !item.url) {
          event.preventDefault();
      }
      
      //hide overlay submenus in horizontal layout
      if(this.app.isHorizontal() && !item.items)
          this.app.resetMenu = true;
      else
          this.app.resetMenu = false;
  }
  
  isActive(index: number): boolean {
      return this.activeIndex === index;
  }

  @Input() get reset(): boolean {
      return this._reset;
  }

  set reset(val:boolean) {
      this._reset = val;

      if(this._reset && this.app.isHorizontal()) {
          this.activeIndex = null;
      }
  }
}
