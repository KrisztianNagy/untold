import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeHtml} from '@angular/platform-browser';

import { SheetElement } from '../../../../../shared/models/sheet-element';

@Component({
  selector: 'app-sheet-mock',
  templateUrl: './sheet-mock.component.html',
  styleUrls: ['./sheet-mock.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SheetMockComponent implements OnInit {
  @Input() sheetElement: SheetElement;
  @Output() onClick = new EventEmitter<SheetElement>();
  htmlContent: SafeHtml;
  constructor(private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    var a = 5;
  }

  childClick(event: any) {
    this.onClick.emit(event);
  }

  log(text: string) {
    alert(text);
  }
}
