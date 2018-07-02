import { Injectable } from '@angular/core';
import {Subject, Observable, fromEvent} from 'rxjs';

import {LayerPositionConstants} from '../../../shared/constants/layer-position-constants';

@Injectable()
export class RenderService {
  stage: createjs.Stage;
  gridLayer: createjs.Container;
  wallLayer: createjs.Container;
  foregroundLayer: createjs.Container;
  backgroundLayer: createjs.Container;
  hiddenLayer: createjs.Container;
  resizeLayer: createjs.Container;
  sightLayer: createjs.Container;

  dropSubject: Subject<DragEvent>;
  tokenClickSubject: Subject<createjs.Event>;
  tokenPressMoveSubject: Subject<createjs.MouseEvent>;
  tokenPressUpSubject: Subject<createjs.MouseEvent>;
  tokenResizerPressMoveSubject: Subject<createjs.MouseEvent>;
  tokenResizerPressUpSubject: Subject<createjs.MouseEvent>;

  stageMouseDown: Observable<createjs.MouseEvent>;
  stageMouseUp: Observable<createjs.MouseEvent>;
  stageMouseMove: Observable<createjs.MouseEvent>;

  numberOfObjects: Array<number>;

  constructor() {
    this.dropSubject = new Subject<DragEvent>();

    this.tokenClickSubject = new Subject<createjs.Event>();
    this.tokenPressMoveSubject = new Subject<createjs.MouseEvent>();
    this.tokenPressUpSubject = new Subject<createjs.MouseEvent>();
    this.tokenResizerPressMoveSubject = new Subject<createjs.MouseEvent>();
    this.tokenResizerPressUpSubject = new Subject<createjs.MouseEvent>();
    this.stageMouseDown = new Subject<createjs.MouseEvent>();
    this.stageMouseUp = new Subject<createjs.MouseEvent>();
    this.stageMouseMove = new Subject<createjs.MouseEvent>();

    this.numberOfObjects = [0, 0, 0, 0];
  }

  init(canvasName: string) {
    this.stage = new createjs.Stage('demoCanvas');
    this.gridLayer = new createjs.Container();
    this.wallLayer = new createjs.Container();
    this.foregroundLayer = new createjs.Container();
    this.backgroundLayer = new createjs.Container();
    this.hiddenLayer = new createjs.Container();
    this.resizeLayer = new createjs.Container();
    this.sightLayer = new createjs.Container();

    this.foregroundLayer.name = 'Foreground layer';
    this.backgroundLayer.name = 'Background layer';
    this.hiddenLayer.name = 'Hidden layer';

    this.stage.addChild(this.backgroundLayer);
    this.stage.addChild(this.gridLayer);
    this.stage.addChild(this.wallLayer);
    this.stage.addChild(this.hiddenLayer);
    this.stage.addChild(this.foregroundLayer);
    this.stage.addChild(this.resizeLayer);
    this.stage.addChild(this.sightLayer);

    this.stageMouseDown = fromEvent<createjs.MouseEvent>(this.stage, 'stagemousedown');
    this.stageMouseUp = fromEvent<createjs.MouseEvent>(this.stage, 'stagemouseup');
    this.stageMouseMove = fromEvent<createjs.MouseEvent>(this.stage, 'stagemousemove');
  }

  update() {
    this.stage.setChildIndex(this.backgroundLayer, LayerPositionConstants.Background);
    this.stage.setChildIndex(this.gridLayer, LayerPositionConstants.Grid);
    this.stage.setChildIndex(this.wallLayer, LayerPositionConstants.Wall);
    this.stage.setChildIndex(this.hiddenLayer, LayerPositionConstants.Hidden);
    this.stage.setChildIndex(this.foregroundLayer, LayerPositionConstants.Foreground);
    this.stage.setChildIndex(this.resizeLayer, LayerPositionConstants.Resize);
    this.stage.setChildIndex(this.sightLayer, LayerPositionConstants.Sight);
    this.stage.update();
    this.updateNumberOfObjects();
  }

  getCanvasOffset(): createjs.Point {
    const canvas = document.getElementById('demoCanvas');
    const bodyRect = document.body.getBoundingClientRect();
    const elemRect = canvas.getBoundingClientRect();
    const offSet = new createjs.Point(bodyRect.left - elemRect.left, bodyRect.top - elemRect.top);

    return offSet;
  }

  private updateNumberOfObjects() {
    this.numberOfObjects = [this.gridLayer.getNumChildren(),
                           this.wallLayer.getNumChildren(),
                           this.backgroundLayer.getNumChildren(),
                           this.foregroundLayer.getNumChildren(),
                           this.sightLayer.getNumChildren()];
  }
}
