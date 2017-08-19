import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { AceEditorComponent } from 'ng2-ace-editor';
import { Editor } from 'primeng/primeng';

@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss']
})
export class EditSheetComponent implements OnInit, AfterViewInit {
  @ViewChild('editorhtml') editorhtml;
  @ViewChild('editorcss') editorcss;

  private htmlText = '';
  private cssText = '';


  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.editorhtml.setTheme("eclipse");

    this.editorhtml.getEditor().setOptions({
        enableBasicAutocompletion: true
    });

    this.editorhtml.getEditor().commands.addCommand({
        name: "showOtherCompletions",
        bindKey: "Ctrl-.",
        exec: function (editor) {
        }
    });

    this.editorcss.setTheme("eclipse");
    
        this.editorcss.getEditor().setOptions({
            enableBasicAutocompletion: true
        });
    
        this.editorcss.getEditor().commands.addCommand({
            name: "showOtherCompletions",
            bindKey: "Ctrl-.",
            exec: function (editor) {
            }
        });
}

}
