import { Component, OnInit } from '@angular/core';

import { Editor } from 'primeng/primeng';

@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss']
})
export class EditSheetComponent implements OnInit {
  private htmlText = '';
  
  constructor() { }

  ngOnInit() {
  }

}
