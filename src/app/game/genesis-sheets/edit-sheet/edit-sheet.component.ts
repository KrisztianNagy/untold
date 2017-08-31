import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/debounce';
import { Subject } from 'rxjs/Subject';

import { SelectItem } from 'primeng/primeng';

import { Untold } from '../../../shared/models/backend-export';
import { AceEditorComponent } from 'ng2-ace-editor';
import { Editor } from 'primeng/primeng';
import { SheetViewerComponent } from '../../../sheet-viewer/sheet-viewer.component';
import { EntityService } from '../../../store/services/entity.service';
import { SheetService } from '../../../store/services/sheet.service';
import { Sheet } from '../../../store/models/sheet';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { GameWorkflowSheetService } from '../../../shared/services/game-flow/game-workflow-sheet.service';
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

  private sheet: Sheet;
  private htmlTextToProcess = '';
  private cssTextToProcess = '';
  private model: any;
  private buildResultIcon: string;
  private id: number;
  private routeSub: any;
  private sheetSub: any;
  private textChangeSub: Subject<boolean>;
  private textChangeDelaySub: any;
  private entities: Array<SelectItem>;
  private selectedEntity: Untold.ClientEntity;
  private sheetVisible: boolean;

  constructor(private sheetService: SheetService,
              private entityEnhancerService: EntityEnhancerService,
              private sheetEntityService: SheetEntityService,
              private entityService: EntityService,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private route: ActivatedRoute,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
   }

  ngOnInit() {
    this.textChangeSub = new Subject<boolean>();

    this.textChangeDelaySub = this.textChangeSub.debounceTime(5000).subscribe(() => {
        this.sheetVisible = true;
        this.htmlTextToProcess = this.sheet.html;
        this.cssTextToProcess = this.sheet.css;
        this.changeDetectorRef.markForCheck();
    });

    this.routeSub = this.route.params.subscribe(params => {
    if (params['id']) {
        this.id = parseInt(params['id'], 10);
        console.log(this.id);
        this.sheetSub = this.sheetService.sheets
        .subscribe(sheets =>
             sheets.filter(sh => sh.id === this.id)
            .forEach(sh => {
                this.sheet = sh;

                if (this.sheetSub) {
                    this.sheetSub.unsubscribe();
                }

                this.entities = this.entityService.getCurrent().map(ent => {
                    return {
                        label: ent.name,
                        value: ent
                      };
                });

                if (this.entities.length) {
                    this.selectedEntity = this.entities[0].value;
                }

                this.setModel();

                this.textChangeSub.next(true);
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

    if (this.sheetSub){
        this.sheetSub.unsubscribe();
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
        console.log('sheet completed');
        this.buildResultIcon = event ? 'ui-icon-check' : 'ui-icon-error';
        this.changeDetectorRef.markForCheck();
    }

    private entityChanged() {
        this.setModel();
    }

    private setModel() {
        if (this.selectedEntity) {
            this.entityEnhancerService.getGenesisEntity(this.selectedEntity).subscribe(gen => {
                let simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
                this.model = simple;

                this.changeDetectorRef.markForCheck();
            });
        } else {
            this.model = {};
        }
    }

    private saveSheet() {
        this.gameWorkflowSheetService.saveSheetContent(this.sheet);
    }

    editorChanged(event) {
        this.buildResultIcon = 'ui-icon-autorenew';
        this.textChangeSub.next(true);
    }

}
