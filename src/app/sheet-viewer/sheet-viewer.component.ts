import {Component, Directive, Injectable, ElementRef, NgModule, Input, ViewContainerRef, Compiler, ComponentFactory,
  ModuleWithComponentFactories, ComponentRef, ReflectiveInjector, OnInit, OnDestroy, ComponentFactoryResolver,
  EmbeddedViewRef, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter, DoCheck } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import 'rxjs/add/operator/debounce';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'app-sheet-viewer',
  templateUrl: './sheet-viewer.component.html',
  styleUrls: ['./sheet-viewer.component.scss']
})
export class SheetViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() html: string;
  @Input() css: string;
  @Input() model: any;
  @Output() onBuildCompleted = new EventEmitter<boolean>();
  @Output() entityChangedEvent = new EventEmitter<any>();
  @ViewChild('div', {read: ViewContainerRef}) div;
  componentRef: any;
  errorMsg = '';
  private emitterSubscription;

  constructor(public compiler: Compiler, public vcRef: ViewContainerRef) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.emitterSubscription) {
      this.emitterSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let modelChange = false;
    let contentChange = false;

    for (const propName in changes) {
      if (propName === 'entity') {
        if (this.componentRef) {
          modelChange = true;
        }
      } else if (propName === 'html' || propName === 'css') {
        contentChange = true;
      }
    }

    if (contentChange) {
      this.createWidget(this.html, this.css, this.model);
    } else if (modelChange) {
      this.componentRef.instance.pushChanges(this.model);
    }
  }

  private createWidget(template: string, style: string, model) {
      const html = template;
      if (!html)  {
        return;
      }

      model = model ? model : {};

      const compMetadata = new Component({
          selector: 'dynamic-html',
          template: html,
          styles: style ? [style] : []
      });

      if (this.componentRef) {
        console.log('destroy previous');
        this.componentRef.destroy();
      }

      try {
        if (this.emitterSubscription) {
          this.emitterSubscription.unsubscribe();
        }

        this.compiler.clearCache();
        this.createComponentFactory( this.compiler, compMetadata, model )
            .then(factory => {
              this.componentRef = this.div.createComponent(factory);

              this.errorMsg = '';
              this.onBuildCompleted.emit(true);

              this.emitterSubscription = this.componentRef.instance.entityChangedEvent.subscribe(entity => {
                this.entityChangedEvent.emit(entity);
                console.log('emitter fired');
              });
            })
            .catch(() => {
              if (this.componentRef) {
                this.componentRef.destroy();                             }
            });
        } catch (err) {
          this.compiler.clearCache();
          this.errorMsg = err.message ? err.message : err.originalStack;
          console.log('Cant compile');
          this.onBuildCompleted.emit(false);
        }

  }

  private createComponentFactory( compiler: Compiler, metadata: Component, model: Object ) {
      @Component( metadata )
      class DynamicComponent implements DoCheck, OnDestroy, OnInit  {
        @Output() entityChangedEvent = new EventEmitter<any>();
        private changeSub: Subject<boolean>;
        private changeDelaySub: any;
        oldEntity: any;
        entity: any;

        constructor() {
          this.entity = JSON.parse(JSON.stringify(model));
          this.oldEntity = JSON.parse(JSON.stringify(this.entity));
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
