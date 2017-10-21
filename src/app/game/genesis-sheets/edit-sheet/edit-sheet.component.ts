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
import { Sheet, SheetScript } from '../../../store/models/sheet';
import { RealmDefinitionService } from '../../../store/services/realm-definition.service';
import { EntityEnhancerService } from '../../../shared/services/expressions/entity-enhancer.service';
import { DefinitionEnhancerService } from '../../../shared/services/expressions/definition-enhancer.service';
import { SheetEntityService } from '../../../shared/services/expressions/sheet-entity.service';
import { GameWorkflowSheetService } from '../../../shared/services/game-flow/game-workflow-sheet.service';
import { WebWorkerService } from '../../../shared/services/web-worker.service';
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
  @ViewChild('editorscript') editorscript;
  @ViewChild('editorsnippet') editorsnippet;
  @ViewChild(SheetViewerComponent) sheetViewer: SheetViewerComponent;
  private previewVisible: boolean;

  private sheet: Sheet;
  private htmlTextToProcess = '';
  private cssTextToProcess = '';
  private scriptsToProcess = [];
  private model: any;
  private buildResultIcon: string;
  private id: number;
  private routeSub: any;
  private sheetSub: any;
  private textChangeSub: Subject<boolean>;
  private textChangeDelaySub: any;
  private entities: Array<SelectItem>;
  private commands: Array<SelectItem>;
  private selectedEntity: Untold.ClientEntity;
  private sheetVisible: boolean;
  private modelMappings: Array<SelectItem>;
  private selectedMapping: string;
  private snippet: any;
  private displayDefinitionsChart: boolean;
  private definition: Untold.ClientDefinition;
  private snippetDefinition: Untold.ClientInnerDefinition;
  private options: object;
  private selectedCommand: SheetScript
  private selectedScript: string;
  private commandResult: any;

  constructor(private sheetService: SheetService,
              private entityEnhancerService: EntityEnhancerService,
              private definitionEnhancerService: DefinitionEnhancerService,
              private sheetEntityService: SheetEntityService,
              private entityService: EntityService,
              private realmDefinitionService: RealmDefinitionService,
              private gameWorkflowSheetService: GameWorkflowSheetService,
              private webWorkerService: WebWorkerService,
              private route: ActivatedRoute,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
    this.snippet = { text: ''};
   }

  ngOnInit() {
    this.textChangeSub = new Subject<boolean>();
    this.modelMappings = [{label: 'Select mapping', value: null}];

    this.textChangeDelaySub = this.textChangeSub.debounceTime(5000).subscribe(() => {
        this.sheetVisible = true;
        this.htmlTextToProcess = this.sheet.html;
        this.cssTextToProcess = this.sheet.css;
        this.scriptsToProcess = JSON.parse(JSON.stringify(this.sheet.scripts));
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
                this.populateDefinitionMapping();
                this.populateCommands();
                this.setModel();

                this.textChangeSub.next(true);

                this.definitionEnhancerService.getAllChoiceOptions(<Untold.ClientInnerDefinition> this.definition)
                .subscribe(choiceOptions => {
                    this.options = choiceOptions;
                    this.changeDetectorRef.markForCheck();
                });
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

    if (this.sheetSub) {
        this.sheetSub.unsubscribe();
    }
  }

    ngAfterViewInit() {
        this.editorsnippet.setTheme('eclipse');
        this.editorsnippet.getEditor();

        this.editorhtml.setTheme('eclipse');

        this.editorhtml.getEditor().setOptions({
            enableBasicAutocompletion: true
        });

        this.editorhtml.getEditor().commands.addCommand({
            name: 'showOtherCompletions',
            bindKey: 'Ctrl-.',
            exec: function (editor) {
            }
        });

        this.editorcss.setTheme('eclipse');
        this.editorcss.getEditor().setOptions({
            enableBasicAutocompletion: true
        });

        this.editorcss.getEditor().commands.addCommand({
            name: 'showOtherCompletions',
            bindKey: 'Ctrl-.',
            exec: function (editor) {
            }
        });

        this.editorscript.setTheme('eclipse');
        this.editorscript.getEditor().setOptions({
            enableBasicAutocompletion: true
        });

        this.editorscript.getEditor().commands.addCommand({
            name: 'showOtherCompletions',
            bindKey: 'Ctrl-.',
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

    entityChanged() {
        this.setModel();
    }

    private setModel() {
        if (this.selectedEntity) {
            this.entityEnhancerService.getGenesisEntity(this.selectedEntity).subscribe(gen => {
                const simple = this.sheetEntityService.getSimpleEntityFromGenesisEntity(gen);
                this.model = simple;

                this.changeDetectorRef.markForCheck();
            });
        } else {
            this.model = {};
        }
    }

    private populateDefinitionMapping() {
        const modules = this.realmDefinitionService.getCurrent();

        modules.forEach(mod => {
            mod.definitions.forEach(def => {
                if (def.definitionGuid === this.sheet.definitionGuid) {
                    this.definition = def;
                }
            });
        });
    }

    private populateCommands() {
        this.commands = this.sheet.scripts.map(cmd => {
            return {
                label: cmd.name,
                value: cmd
              };
        });

        this.selectedCommand = this.commands.length ? this.commands[0].value : null;

        if (this.selectedCommand) {
            this.selectedScript = this.selectedCommand.script;
        } else {
            this.selectedScript = '';
        }
        this.changeDetectorRef.markForCheck();
    }

    private addCommand() {
        let script = '// This is your command. Use the JSON representation above to change your model\n';
        script += '// For example: entity[\'property name\'] = 5;\n\n\n\n';
        script += '//At the end of your code you can return the array of chat commands you would like to execute:\n';
        script += '//return [\n';
        script += '//\t\'#roll 1d6 + 3\',\n';
        script += '//\tAttack with long sword!\n';
        script += '//}';

        this.sheet.scripts = [...this.sheet.scripts, {name: 'Command name', script: script}];

        this.populateCommands();

        if (this.commands.length) {
            this.selectedCommand = this.commands[this.commands.length - 1].value;
            this.selectedScript = this.selectedCommand.script;
        }
        this.commandResult = null;

        this.changeDetectorRef.markForCheck();
    }

    private deleteCommand() {
        this.sheet.scripts = this.sheet.scripts.filter(cmd => {
            return !(this.selectedCommand.name === cmd.name && this.selectedCommand.script === cmd.script);
        });

        this.commandResult = null;

        this.populateCommands();
    }

    commandChanged() {
        this.commandResult = null;
    }

    private selectDefinition() {
        this.displayDefinitionsChart = true;
    }

    private onDefinitionClick(definition) {
        this.displayDefinitionsChart = false;
        this.snippetDefinition = definition;

        this.snippet.text = this.snippetDefinition.name;
        this.snippetGenerator(definition);
    }

    private saveSheet() {
        this.gameWorkflowSheetService.saveSheetContent(this.sheet);
    }

    editorChanged(event) {
        this.buildResultIcon = 'ui-icon-autorenew';
        this.textChangeSub.next(true);
    }

    commandEditorChanged(event) {
        this.selectedCommand.script = this.selectedScript;
        this.commands.forEach((cmd, index) => {
            this.sheet.scripts[index].name = cmd.value.name;
            this.sheet.scripts[index].script = cmd.value.script;
        });

        this.populateCommands();
        this.editorChanged(null);
    }

    onCommandExecuted(commandName: string) {

    }

    testCommand() {
        const worker = this.webWorkerService.createCommandWorker(this.selectedCommand.script);

        worker.onmessage = (result) => {
            this.commandResult = result.data;
        };

        worker.postMessage(this.model);
    }

    private snippetGenerator(definition: Untold.ClientInnerDefinition) {
        const introductionSnippet = 'These are the snippets you can use to interact with the ' + definition.name + ' property\n\n';
        let definitionChain = this.definitionEnhancerService.findDefinitionContainerChain(<any> this.definition, definition);

        if (definitionChain.length > 0) {
            definitionChain = definitionChain.slice(1);
        }

        this.snippet.text = introductionSnippet + this.digIn(definitionChain, 0, 'entity', 0, '');
    }

    // tslint:disable-next-line:max-line-length
    private digIn(definitionChain: Array<Untold.ClientInnerDefinition>, position: number, path: string, listNumber: number, padding: string) {
        const definition = definitionChain[position];
        path = path + '[\'' + definition.name + '\']';
        let nextPadding = padding;

        if (definitionChain.length === position + 1) {
            if (definition.isList) {
                const listhtml = this.populateList(definition, path, true, listNumber);
                let html = listhtml.start.split('\n').map(row => padding + row).join('\n');
                html += '\n' + listhtml.end.split('\n').map(row => padding + row).join('\n');

                return html;
            }
            return padding + this.populateDataTypes(definition, path).split('\n').map(row => padding + row).join('\n');
        } else {
            let html = '';
            let listhtml;
            if (definition.isList) {
                listNumber++;
                nextPadding = padding + '\t';
                listhtml = this.populateList(definition, path, false, listNumber);
                html += listhtml.start.split('\n').map(row => padding + row).join('\n');
                path = 'list' + listNumber;
            }

            html +=  this.digIn(definitionChain, position + 1, path, listNumber, nextPadding);

            if (definition.isList) {
                html += '\n' + listhtml.end.split('\n').map(row => padding + row).join('\n');
            }

            return html;
        }
    }

    private populateList(definition: Untold.ClientInnerDefinition, path: string, detailed: boolean, listNumber) {
        const listId = 'list' + listNumber;
        if (definition.isPredefinedList) {
            let html = definition.name + ' is a predefined list so we have to list the available items\n';
            html += '<div *ngFor="let ' + listId + ' of ' + '[' + definition.predefinedListItems.map(item => '\'' + item + '\'') + ']">\n';

            return {start: html, end: '</div>'};
        } else {
            let html = definition.name + ' is a user list so we have to show all elements\n';
            html += '<div *ngFor="let ' + listId + ' of ' + path + '">\n';
            return {start: html, end: '</div>'};
        }
    }

    private populateDataTypes(definition: Untold.ClientInnerDefinition, snippet: string): string {
        let dataHtml = '\n';

        switch  (definition.dataType) {
            case 'text':
            dataHtml += 'Use the curly braces to display the value:\n<span>{{' + snippet + '}}</span>\n\n' ;
            dataHtml += definition.isCalculated ?
                // tslint:disable-next-line:max-line-length
                'Bind the property to a readonly input because it is calculated:\n<input type="text" id="item_name" [ngModel]="' + snippet + '" readonly>\n\n' :
                'Bind the property to an input:\n<input type="text" id="item_name" [(ngModel)]="' + snippet + '">\n';
            break;
            case 'number':
            dataHtml += 'Use the curly braces to display the value:\n<span>{{' + snippet + '}}</span>\n';
            dataHtml += definition.isCalculated ?
            // tslint:disable-next-line:max-line-length
            'Bind the property to a readonly input because it is calculated:\n<input type="number" id="item_name" [ngModel]="' + snippet + '" readonly>\n\n' :
            'Bind the property to an input:\n<input type="number" id="item_name" [(ngModel)]="' + snippet + '">\n';
            break;
            case 'bool':
            dataHtml += 'Use the curly braces with expressions to the value:\n<span>{{' + snippet + ' ? \'Yes\ : \'No\'}}</span>\n';
            dataHtml += definition.isCalculated ?
            // tslint:disable-next-line:max-line-length
            'Bind the property to a readonly checkbox bacause it is calculated:\n<input type="checkbox" id="item_name" [ngModel]="' + snippet + '" readonly>' :
            'Bind the property to a checkbox:\n<input type="checkbox" id="item_name" [(ngModel)]="' + snippet + '">\n';
            break;
            case 'choice':

            dataHtml += 'Use the curly braces to display the value:\n<span>{{' + snippet + '}}</span>\n\n' ;
            dataHtml += 'Bind the property to an input.:\n' +
                '<select type="text" [(ngModel)]="' + snippet + '">\n' +
                // tslint:disable-next-line:max-line-length
                '\t<option *ngFor="let choiceOption of getChoiceOptions('+ snippet + ')" [ngValue]="choiceOption"> {{choiceOption}}</option>\n' +
                '</select>';
            break;
            default:
            break;
        }

        return dataHtml;
    }
}
