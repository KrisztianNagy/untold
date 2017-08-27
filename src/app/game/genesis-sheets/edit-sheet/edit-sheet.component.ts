import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/delay';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../../../shared/models/backend-export';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Editor } from 'primeng/primeng';
import { SheetViewerComponent } from '../../../sheet-viewer/sheet-viewer.component';
import { EntityService } from '../../../store/services/entity.service';
import { SheetService } from '../../../store/services/sheet.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss']
})
export class EditSheetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorhtml') editorhtml;
  @ViewChild('editorcss') editorcss;
  @ViewChild(SheetViewerComponent) sheetViewer: SheetViewerComponent;

  private htmlText = '';
  private cssText = '';
  private htmlTextToProcess = '';
  private cssTextToProcess = '';
  private model: any;
  private buildResultIcon: string;
  private id: number;
  private routeSub: any;
  private sheetSub: any;
  private textChangeSub: Subject<boolean>;
  private textChangeDelaySub: any;
  private entities: Untold.ClientEntity[] = [];

  constructor(private sheetService: SheetService,
              private entityEnhancerService: EntityEnhancerService,
              private sheetEntityService: SheetEntityService,
              private entityService: EntityService,
              private route: ActivatedRoute,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
   }

  ngOnInit() {
    /* this.entityService.entities.subscribe(ent => {
    this.entityEnhancerService.getGenesisEntity(ent[0]).subscribe(gen => {
        let simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
        this.model = simple;
        });
    });*/

    this.textChangeSub = new Subject<boolean>();

    this.textChangeDelaySub = this.textChangeSub.delay(5000).subscribe(() => {
        this.htmlTextToProcess = this.htmlText;
        this.cssTextToProcess = this.cssText;
    });

    this.routeSub = this.route.params.subscribe(params => {
    if (params['id']) {
        this.id = parseInt(params['id'], 10);

        this.sheetSub = this.sheetService.sheets
        .subscribe(sheets =>
            sheets.filter(sh => sh.id === this.id)
            .forEach(sh => {
                this.htmlText = sh.html;
                this.cssText = sh.css;
                this.sheetSub.unsubscribe();

                this.entities = this.entityService.getCurrent();
            }));
        }
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();

    if (this.textChangeSub) {
        this.textChangeSub.unsubscribe();
    }

    if (this.textChangeDelaySub) {
        this.textChangeDelaySub.unsubscribe();
    }
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
    }

    editorChanged(event) {
        this.textChangeSub.next(true);
    }

}
