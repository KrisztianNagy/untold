import {Component, Directive, Injectable, ElementRef, NgModule, Input, ViewContainerRef, Compiler, ComponentFactory,
  ModuleWithComponentFactories, ComponentRef, ReflectiveInjector, OnInit, OnDestroy, ComponentFactoryResolver,
  EmbeddedViewRef, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sheet-viewer',
  templateUrl: './sheet-viewer.component.html',
  styleUrls: ['./sheet-viewer.component.scss']
})
export class SheetViewerComponent implements OnInit, OnChanges {
  @Input() html: string;
  @Input() css: string;
  @Input() model: any;
  @ViewChild('div', {read: ViewContainerRef}) div;
  componentRef: any;

  constructor(public compiler: Compiler, public vcRef: ViewContainerRef) {
    this.model = {
      a: 'test text'
    };

    this.createWidget(this.html ? this.html : '', this.model);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName === 'entity') {
        if (this.componentRef) {
          this.componentRef.instance.pushChanges(this.model);
        }
      } else if (propName === 'html') {
        this.createWidget(this.html, this.model);
      }
    }
  }

  private createWidget(template: string , model) {
      const html = template;
      if (!html)  {
        return;
      }

      const compMetadata = new Component({
          selector: 'dynamic-html',
          template: html
      });

      if(this.componentRef) {
        this.componentRef.destroy();
        console.log('destroy');
      }

      try {
        this.createComponentFactory( this.compiler, compMetadata, model )
            .then(factory => {
              this.componentRef = this.div.createComponent(factory);
            })
            .catch(() => {
              if(this.componentRef) {
                this.componentRef.destroy();
                console.log('destroy');
              }
            });
        } catch (err) {
          console.log('Cant compile');
        }

  }

  private createComponentFactory( compiler: Compiler, metadata: Component, model: Object ) {
      @Component( metadata )
      class DynamicComponent {
        oldEntity: any;
        entity: any;
        changedEntity: boolean;

        constructor() {
          this.entity = JSON.parse(JSON.stringify(model));
          this.oldEntity = JSON.parse(JSON.stringify(this.entity));

          setTimeout(() => {
            if (JSON.parse(JSON.stringify(this.entity)) !== JSON.parse(JSON.stringify(this.oldEntity))) {
              this.oldEntity = JSON.parse(JSON.stringify(this.entity));
              this.changedEntity = true;
            }
          }, 500);
        }

        pushChanges(pushMmodel: Object){
          this.oldEntity = JSON.parse(JSON.stringify(pushMmodel));
          this.entity = JSON.parse(JSON.stringify(pushMmodel));
          this.changedEntity = false;
        }

        pullChanges(): Object {
          if (this.changedEntity) {
            return JSON.parse(JSON.stringify(this.entity));
          } else {
            return null;
          }
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
