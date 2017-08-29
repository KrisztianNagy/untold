import {Component, Directive, Injectable, ElementRef, NgModule, Input, ViewContainerRef, Compiler, ComponentFactory,
  ModuleWithComponentFactories, ComponentRef, ReflectiveInjector, OnInit, OnDestroy, ComponentFactoryResolver,
  EmbeddedViewRef, ViewChild, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    for (const propName in changes) {
      if (propName === 'entity') {
        if (this.componentRef) {
          this.componentRef.instance.pushChanges(this.model);
        }
      } else if (propName === 'html' || propName === 'css') {
        this.createWidget(this.html, this.css, this.model);
      }
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
      class DynamicComponent implements OnChanges {
        @Output() entityChangedEvent = new EventEmitter<any>();
        oldEntity: any;
        entity: any;

        constructor() {
          this.entity = JSON.parse(JSON.stringify(model));
          this.oldEntity = JSON.parse(JSON.stringify(this.entity));
        }

        ngOnChanges(changes: SimpleChanges): void {
          if (JSON.parse(JSON.stringify(this.entity)) !== JSON.parse(JSON.stringify(this.oldEntity))) {
            this.oldEntity = JSON.parse(JSON.stringify(this.entity));
            this.entityChangedEvent.emit(JSON.parse(JSON.stringify(this.entity)));
          }
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
