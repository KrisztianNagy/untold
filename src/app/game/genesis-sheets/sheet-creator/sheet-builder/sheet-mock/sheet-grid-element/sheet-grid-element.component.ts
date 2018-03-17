import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { SheetElement } from '../../../../../../shared/models/sheet-element';

@Component({
  selector: 'app-sheet-grid-element',
  templateUrl: './sheet-grid-element.component.html',
  styleUrls: ['./sheet-grid-element.component.scss']
})
export class SheetGridElementComponent implements OnInit {
  @Input() sheet: SheetElement;
  @Output() onClick = new EventEmitter<SheetElement>();
  hovered: boolean;

  constructor() { }

  ngOnInit() {
  }

  sheetElementClick(event: any) {
    event.stopPropagation();
    this.onClick.emit(this.sheet);
  }

  childClick(event: any) {
    this.onClick.emit(event);
  }

  hover(value: boolean) {
    this.hovered = value;
    console.log('hover: ' + value);
  }

}
