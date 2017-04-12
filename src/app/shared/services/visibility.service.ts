import { Injectable } from '@angular/core';

import {Wall} from '../../store/models/wall';
import {LineSegment} from '../models/line-segment';
import {EndPoint} from '../models/end-point';

@Injectable()
export class VisibilityService {

  constructor() { }

  getVisibleTriangles(lightSource: createjs.Point, walls: Wall[]) {
    let segments = this.getSegmentsFromWalls(walls);
    this.processSegments(lightSource, segments);

    let endPoints: EndPoint[] = [];

    segments.forEach(segment => {
      endPoints.push(segment.p1);
      endPoints.push(segment.p2);
    });

    const origin: EndPoint = {
      angle: undefined,
      beginsSegment: undefined,
      segment: undefined,
      x: lightSource.x,
      y: lightSource.y
    };

    return this.calculateVisibility(origin, endPoints);
  }

  private getSegmentsFromWalls(walls: Wall[]): LineSegment[] {

    return walls.map(wall => {
      let segment: LineSegment = {
        p1 : {
          angle: undefined,
          beginsSegment: true,
          x: wall.fromX,
          y: wall.fromY,
          segment: undefined,
        },
        p2 : {
          angle: undefined,
          beginsSegment: false,
          x: wall.toX,
          y: wall.toY,
          segment: undefined
        },
        d: undefined
      };

      segment.p1.segment = segment;
      segment.p2.segment = segment;

      return segment;
    });
  }

  private processSegments(lightSource: createjs.Point, segments: LineSegment[]) {
    segments.forEach(segment => {
      this.calculateEndPointAngles(lightSource, segment);
      this.setSegmentBeginning(segment);
    });
  }

  private calculateEndPointAngles(lightSource: createjs.Point, segment: LineSegment) {
    const dx = 0.5 * (segment.p1.x + segment.p2.x) - lightSource.x;
    const dy = 0.5 * (segment.p1.y + segment.p2.y) - lightSource.y;

    segment.d = (dx * dx) + (dy * dy);
    segment.p1.angle = Math.atan2(segment.p1.y - lightSource.y, segment.p1.x - lightSource.x);
    segment.p2.angle = Math.atan2(segment.p2.y - lightSource.y, segment.p2.x - lightSource.x);
  };

  private setSegmentBeginning(segment: LineSegment) {
    let dAngle = segment.p2.angle - segment.p1.angle;

    if (dAngle <= - Math.PI) {
      dAngle += 2 * Math.PI;
    }

    if (dAngle > Math.PI) {
      dAngle -= 2 * Math.PI;
    }

    segment.p1.beginsSegment = dAngle > 0;
    segment.p2.beginsSegment = !segment.p1.beginsSegment;
  }

  private calculateVisibility(origin: EndPoint, endpoints: EndPoint[]): createjs.Point[][] {
    let openSegments: LineSegment[] = [];
    let output: createjs.Point[][] = [];
    let beginAngle = 0;

    endpoints.sort(this.endPointCompare);

    for (let pass = 0; pass < 2; pass += 1) {
      for (let i = 0; i < endpoints.length; i += 1) {
        let endpoint = endpoints[i];
        let openSegment = openSegments[0];

        if (endpoint.beginsSegment) {
          let index = 0;
          let segment = openSegments[index];
          while (segment && this.segmentInFrontOf(endpoint.segment, segment, origin)) {
            index += 1;
            segment = openSegments[index];
          }

          if (!segment) {
            openSegments.push(endpoint.segment);
          } else {
            openSegments.splice(index, 0, endpoint.segment);
          }
        } else {
          let index = openSegments.indexOf(endpoint.segment);
          if (index > -1) {
             openSegments.splice(index, 1);
          }
        }

        if (openSegment !== openSegments[0]) {
          if (pass === 1) {
            let trianglePoints = this.getTrianglePoints(origin, beginAngle, endpoint.angle, openSegment);
            output.push(trianglePoints);
          }
          beginAngle = endpoint.angle;
        }
      }
    }

    return output;
  }

  private endPointCompare(pointA: EndPoint, pointB: EndPoint): number {
    if (pointA.angle > pointB.angle) {
      return 1;
    }

    if (pointA.angle < pointB.angle) {
       return -1;
    }

    if (!pointA.beginsSegment && pointB.beginsSegment) {
      return 1;
    }

    if (pointA.beginsSegment && !pointB.beginsSegment) {
      return -1;
    }
    return 0;
  }

  segmentInFrontOf(segmentA, segmentB, relativePoint) {
    const A1 = this.leftOf(segmentA, this.interpolate(segmentB.p1, segmentB.p2, 0.01));
    const A2 = this.leftOf(segmentA, this.interpolate(segmentB.p2, segmentB.p1, 0.01));
    const A3 = this.leftOf(segmentA, relativePoint);
    const B1 = this.leftOf(segmentB, this.interpolate(segmentA.p1, segmentA.p2, 0.01));
    const B2 = this.leftOf(segmentB, this.interpolate(segmentA.p2, segmentA.p1, 0.01));
    const B3 = this.leftOf(segmentB, relativePoint);

    if (B1 === B2 && B2 !== B3) {
       return true;
    }

    if (A1 === A2 && A2 === A3) {
       return true;
    }

    if (A1 === A2 && A2 !== A3) {
       return false;
    }

    if (B1 === B2 && B2 === B3) {
       return false;
    }

    return false;
  }

  leftOf(segment, point) {
    const cross = (segment.p2.x - segment.p1.x) * (point.y - segment.p1.y)
                - (segment.p2.y - segment.p1.y) * (point.x - segment.p1.x);
    return cross < 0;
  }

  interpolate(pointA: createjs.Point, pointB: createjs.Point, f: number): createjs.Point {
    return new createjs.Point(
      pointA.x * (1 - f) + pointB.x * f,
      pointA.y * (1 - f) + pointB.y * f
    );
  }

  private getTrianglePoints(origin: EndPoint, angle1: number, angle2: number, segment: LineSegment): createjs.Point[] {
    const p1 = new createjs.Point(origin.x, origin.y);
    const p2 = new createjs.Point(origin.x + Math.cos(angle1), origin.y + Math.sin(angle1));
    const p3 = new createjs.Point(0, 0);
    const p4 = new createjs.Point(0, 0);

    if (segment) {
      p3.x = segment.p1.x;
      p3.y = segment.p1.y;
      p4.x = segment.p2.x;
      p4.y = segment.p2.y;
    } else {
      p3.x = origin.x + Math.cos(angle1) * 200;
      p3.y = origin.y + Math.sin(angle1) * 200;
      p4.x = origin.x + Math.cos(angle2) * 200;
      p4.y = origin.y + Math.sin(angle2) * 200;
    }

    const pBegin = this.lineIntersection(p3, p4, p1, p2);

    p2.x = origin.x + Math.cos(angle2);
    p2.y = origin.y + Math.sin(angle2);

    const pEnd = this.lineIntersection(p3, p4, p1, p2);

    return [pBegin, pEnd];
  }

  private lineIntersection(point1: createjs.Point, point2: createjs.Point, point3: createjs.Point, point4: createjs.Point): createjs.Point {
    const s = (
      (point4.x - point3.x) * (point1.y - point3.y) -
      (point4.y - point3.y) * (point1.x - point3.x)
    ) / (
      (point4.y - point3.y) * (point2.x - point1.x) -
      (point4.x - point3.x) * (point2.y - point1.y)
    );

    return new createjs.Point(
      point1.x + s * (point2.x - point1.x),
      point1.y + s * (point2.y - point1.y)
    );
  }
}
