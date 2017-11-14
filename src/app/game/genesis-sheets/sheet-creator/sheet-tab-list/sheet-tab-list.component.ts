import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { SheetTab } from '../../../../store/models/sheet';

@Component({
  selector: 'app-sheet-tab-list',
  templateUrl: './sheet-tab-list.component.html',
  styleUrls: ['./sheet-tab-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SheetTabListComponent implements OnInit {
  @Input() tabs: Array<SheetTab>;
  @Output() onUpdate = new EventEmitter<Array<SheetTab>>();
 
  temporaryTabList: Array<SheetTab>;
  addedTabName: string;

  constructor() { }

  ngOnInit() {
    if (this.tabs) {
      this.temporaryTabList = JSON.parse(JSON.stringify(this.tabs));
    } else {
      this.temporaryTabList = [];
    }
  }

  tabNameIsUnique() {
    if (!this.addedTabName) {
      return false;
    }

    const taken = this.temporaryTabList.some(tab => tab.name.trim() === this.addedTabName.trim());

    return !taken;
  }

  addTab() {
    this.temporaryTabList = [...this.temporaryTabList,  {
      name: this.addedTabName,
      sheet: {
        id: 1,
        type: 'root',
        denominator: 1,
        innerElements: []
      }
    }];
    this.addedTabName = '';
  }

  deleteTab(tab: SheetTab) {
    this.temporaryTabList = this.temporaryTabList.filter(currTab => currTab !== tab);
  }

  
  save() {
    this.onUpdate.emit(this.temporaryTabList);
  }

}
