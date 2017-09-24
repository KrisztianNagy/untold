import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { GameWorkflowSheetService } from '../../../shared/services/game-flow/game-workflow-sheet.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-sheet',
  templateUrl: './edit-sheet.component.html',
  styleUrls: ['./edit-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditSheetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorhtml') editorhtml;
  @ViewChild('editorcss') editorcss;
  @ViewChild(SheetViewerComponent) sheetViewer: SheetViewerComponent;
  private previewVisible: boolean;

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
  private modelMappings: Array<SelectItem>;
  private selectedMapping: string;

  constructor(private sheetService: SheetService,
              private entityEnhancerService: EntityEnhancerService,
              private sheetEntityService: SheetEntityService,
              private entityService: EntityService,
              private realmDefinitionService: RealmDefinitionService,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private route: ActivatedRoute,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
   }

  ngOnInit() {
    this.textChangeSub = new Subject<boolean>();
    this.modelMappings = [{label: 'Select mapping', value: null}];

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
                this.populateModelMappings();
                this.setModel();

                this.textChangeSub.next(true);
            }));
        }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
    this.routeSub.unsubscribe();
    }
    

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
        this.sheetVisible = event;
        this.changeDetectorRef.markForCheck();
    }

    private onModelUpdated() {
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

    private populateModelMappings() {
        this.modelMappings = [{label: 'Select mapping', value: null}];
        const modules = this.realmDefinitionService.getCurrent();

        modules.forEach(mod => {
            mod.definitions.forEach(def => {
                if (def.definitionGuid === this.sheet.definitionGuid) {
                    this.addDefinitionPartsToDropDown(<Untold.ClientInnerDefinition> def, '', false, true);
                }
            });
        });
    }

    private addDefinitionPartsToDropDown(definition: Untold.ClientInnerDefinition, displayName: string, inList: boolean, root: boolean) {
        if (definition) {
            if (!root) {

                displayName += '[\'' + definition.name + '\']';

                if (!definition.isList && !inList) {
                    this.modelMappings.push({label: displayName, value: displayName});
                } else {

                }
            }

            if (definition.definitions) {
                definition.definitions
                    .forEach(def => this.addDefinitionPartsToDropDown(def, displayName, definition.isList || inList, false));
            }
        }
    }

    private saveSheet() {
        this.gameWorkflowSheetService.saveSheetContent(this.sheet);
    }

    private insertMapping() {
        try {
            const cursorPosition = this.editorhtml._editor.getCursorPosition();
            const rows = this.sheet.html.split('\n');

            let selectedRow = rows[cursorPosition.row];
            let textToInsert = '[(ngModel)]="entity' + this.selectedMapping + '"';
            rows[cursorPosition.row]  =
                [selectedRow.slice(0, cursorPosition.column), textToInsert, selectedRow.slice(cursorPosition.column)].join('');

            this.sheet.html = rows.join('\n');
        } catch(err) {
            console.log('Insert failed');
        }

    }

    editorChanged(event) {
        this.buildResultIcon = 'ui-icon-autorenew';
        this.textChangeSub.next(true);
    }

}
