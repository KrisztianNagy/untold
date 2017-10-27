import {Component, Directive, Injectable, ElementRef, NgModule, Input, ViewContainerRef, Compiler, ComponentFactory,
  ModuleWithComponentFactories, ComponentRef, ReflectiveInjector, OnInit, OnDestroy, ComponentFactoryResolver,
  EmbeddedViewRef, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter, DoCheck, ChangeDetectorRef,
  ChangeDetectionStrategy } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import 'rxjs/add/operator/debounce';
import { Subject } from 'rxjs/Subject';

import { Untold } from '../shared/models/backend-export';

@Component({
  selector: 'app-sheet-viewer',
  templateUrl: './sheet-viewer.component.html',
  styleUrls: ['./sheet-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SheetViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() html: string;
  @Input() css: string;
  @Input() model: any;
  @Input() definition: Untold.ClientDefinition;
  @Input() options: object;
  @Output() onBuildCompleted = new EventEmitter<boolean>();
  @Output() entityChangedEvent = new EventEmitter<any>();
  @Output() commandExecuted = new EventEmitter<string>();
  @Output() chatExecuted = new EventEmitter<string>();
  @ViewChild('div', {read: ViewContainerRef}) div;
  componentRef: any;
  errorMsg = '';
  private entityChangedSubscription;
  private commandExecutedSubscription;
  private chatExecutedSubscription;
  private errorSubscription;

  constructor(public compiler: Compiler,
              public vcRef: ViewContainerRef,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.entityChangedSubscription) {
      this.entityChangedSubscription.unsubscribe();
    }

    if (this.commandExecutedSubscription) {
      this.commandExecutedSubscription.unsubscribe();
    }

    if (this.chatExecutedSubscription) {
      this.chatExecutedSubscription.unsubscribe();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let modelChange = false;
    let contentChange = false;

    for (const propName in changes) {
      if (propName === 'model') {
        if (this.componentRef) {
          modelChange = true;
        }
      } else if (propName === 'html' || propName === 'css') {
        contentChange = true;
      }
    }

    if (contentChange) {
      this.createWidget(this.html, this.css, this.model, this.options, this.definition);
    } else if (modelChange) {
      this.componentRef.instance.pushChanges(this.model);
      this.changeDetectorRef.markForCheck();
    }
  }

  private createWidget(template: string, style: string, model, options, definition) {
      const html = template;
      if (!html)  {
        return;
      }

      this.div.clear();

      model = model ? model : {};
      this.errorMsg = '';

      const compMetadata = new Component({
          selector: 'dynamic-html',
          template: html,
          styles: style ? [style] : [],
          changeDetection: ChangeDetectionStrategy.OnPush
      });

      if (this.componentRef) {
        console.log('destroy previous');
        this.componentRef.destroy();
      }

      try {
        if (this.entityChangedSubscription) {
          this.entityChangedSubscription.unsubscribe();
        }

        if (this.commandExecutedSubscription) {
          this.commandExecutedSubscription.unsubscribe();
        }

        if (this.chatExecutedSubscription) {
          this.chatExecutedSubscription.unsubscribe();
        }

        this.compiler.clearCache();
        this.createComponentFactory( this.compiler, compMetadata, model, options, definition )
            .then(factory => {
              this.componentRef = this.div.createComponent(factory);

              this.errorMsg = '';
              this.onBuildCompleted.emit(true);
              this.changeDetectorRef.markForCheck();

              this.entityChangedSubscription = this.componentRef.instance.entityChangedEvent.subscribe(entity => {
                this.entityChangedEvent.emit(entity);
                console.log('emitter fired');
              });

              this.commandExecutedSubscription = this.componentRef.instance.commandExecutedEvent.subscribe(command => {
                this.commandExecuted.emit(command);
              });

              this.chatExecutedSubscription = this.componentRef.instance.chatExecutedEvent.subscribe(text => {
                this.chatExecuted.emit(text);
              });

              this.errorSubscription = this.componentRef.instance.runtimeErrorOccuredEvent.subscribe(error => {
                if (this.componentRef) {
                  this.componentRef.destroy();
                  console.log('destroyed');
                }

                this.div.clear();
                this.compiler.clearCache();
                this.errorMsg = error.message ? error.message : error.originalStack;

                this.onBuildCompleted.emit(false);
                this.changeDetectorRef.markForCheck();
              });
            })
            .catch(() => {
              if (this.componentRef) {
                this.componentRef.destroy();
              }

              this.changeDetectorRef.markForCheck();
            });
        } catch (err) {
          this.compiler.clearCache();
          this.errorMsg = err.message ? err.message : err.originalStack;
          console.log('Cant compile');
          this.onBuildCompleted.emit(false);
          this.changeDetectorRef.markForCheck();
        }

        this.changeDetectorRef.markForCheck();
  }

  private destroyAll() {

  }

  // tslint:disable-next-line:max-line-length
  private createComponentFactory( compiler: Compiler, metadata: Component, model: Object, options: Object, definition: Untold.ClientDefinition ) {
      @Component( metadata )
      class DynamicComponent implements DoCheck, OnDestroy, OnInit  {
        @Output() entityChangedEvent = new EventEmitter<any>();
        @Output() commandExecutedEvent = new EventEmitter<any[]>();
        @Output() chatExecutedEvent = new EventEmitter<string>();
        @Output() runtimeErrorOccuredEvent = new EventEmitter<any>();
        private changeSub: Subject<boolean>;
        private changeDelaySub: any;
        oldEntity: any;
        entity: any;
        definition: any;
        options: object;

        constructor(private changeDetectorRef: ChangeDetectorRef) {
          this.entity = JSON.parse(JSON.stringify(model));
          this.oldEntity = JSON.parse(JSON.stringify(this.entity));
          this.definition = definition;
          this.options = options;
          this.changeDetectorRef.markForCheck();
        }

        ngOnInit() {
          this.changeSub = new Subject<boolean>();
              this.changeDelaySub = this.changeSub.debounceTime(500).subscribe(() => {
                if (JSON.stringify(this.entity) !== JSON.stringify(this.oldEntity)) {
                  this.oldEntity = JSON.parse(JSON.stringify(this.entity));
                  this.entityChangedEvent.emit(JSON.parse(JSON.stringify(this.entity)));
                }
              });
        }

        ngOnDestroy(): void {
          if (this.changeSub) {
              this.changeSub.unsubscribe();
          }

          if (this.changeDelaySub) {
              this.changeDelaySub.unsubscribe();
          }
        }

        ngDoCheck () {
          this.changeSub.next(true);
        }

        pushChanges(pushModel: Object) {
          this.oldEntity = JSON.parse(JSON.stringify(pushModel));
          this.entity = JSON.parse(JSON.stringify(pushModel));
          this.changeDetectorRef.markForCheck();
        }

        handleRuntimeError(error: any) {
          this.runtimeErrorOccuredEvent.emit(error);
        }

        addItem(list: Array<any>) {
          list.push({});
        }

        removeItem(list: Array<any>, item: any) {
          const index = list.indexOf(item);

          if (index > -1) {
            for (let i = index; i < list.length - 1; i++) {
              list[i] = list[i + 1];
            }

            list.pop();
          }
        }

        getChoiceOptions (target: object) {
          const matchingGuid = this.recursiveOptionSearch(this.entity, this.definition, target);

          if (matchingGuid) {
            return this.options[matchingGuid];
          }

          return [];
        }

        recursiveOptionSearch(parentModel: object, parentDefinition: Untold.ClientInnerDefinition, target: object) {
          for (const property in parentModel) {
            if (parentModel.hasOwnProperty(property)) {
              const matchingDef = parentDefinition.definitions.filter(def => def.name === property);

              if (matchingDef.length > 0) {
                 if (parentModel[property] === target) {
                  return matchingDef[0].occurrenceGuid;
                 }

                 if (matchingDef[0].definitions) {
                   const result = this.recursiveOptionSearch(parentModel[property], matchingDef[0], target);

                   if (result) {
                     return result;
                   }
                 }
              }
            }
          }

          return '';
        }

        command(commandName: string, ...parameters: any[]) {
          this.commandExecutedEvent.emit([commandName, ...parameters]);
        }

        chat(chatText: string) {
          this.chatExecutedEvent.emit(chatText);
        }
      };

      @NgModule({
          imports: [ CommonModule, BrowserModule, FormsModule ],
          declarations: [ DynamicComponent ]
      })
      class DynamicHtmlModule { }
      return compiler.compileModuleAndAllComponentsAsync( DynamicHtmlModule )
          .then(( moduleWithComponentFactory: ModuleWithComponentFactories<any> ) => {
              return moduleWithComponentFactory.componentFactories.find( x => {
                return x.componentType === DynamicComponent;
              });
          })
          .catch(() => {
            console.log('not complete');
          });
  }

}
