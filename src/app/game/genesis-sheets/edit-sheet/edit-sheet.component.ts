import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { AceEditorComponent } from 'ng2-ace-editor';
import { Editor } from 'primeng/primeng';
import { SheetViewerComponent } from '../../../sheet-viewer/sheet-viewer.component';
import { EntityService } from '../../../store/services/entity.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';


@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss']
})
export class EditSheetComponent implements OnInit, AfterViewInit {
  @ViewChild('editorhtml') editorhtml;
  @ViewChild('editorcss') editorcss;
  @ViewChild(SheetViewerComponent) sheetViewer: SheetViewerComponent;

  private htmlText = '';
  private cssText = '';
  private model: any;
  private buildResultIcon: string;

  constructor(private entityService: EntityService,
              private entityEnhancerService: EntityEnhancerService,
              private sheetEntityService: SheetEntityService) {
      this.model = {
          name: 'My name',
          size: '15'
      };
   }

  ngOnInit() {
      this.entityService.entities.subscribe(ent => {
        this.entityEnhancerService.getGenesisEntity(ent[0]).subscribe(gen => {
            let simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
            this.model = simple;
          });
      });
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

    onBuildCompleted(event: boolean) {
        this.buildResultIcon = event ? 'ui-icon-check' : 'ui-icon-error';
    }

    onModelUpdated(event: any) {
        this.entityService.entities.subscribe(ent => {
            this.entityEnhancerService.getGenesisEntity(ent[0]).subscribe(gen => {
                let entity = this.sheetEntityService.getEntityFromSimpleEntity(gen, event);
                console.log('success');
              });
          });
    }

}
