import { Injectable } from '@angular/core';

import {AreaBox} from '../../../models/area-box';

@Injectable()
export class SimpleDungeonService {

  constructor() { }



  generate(width: number, height: number): Array<Array<number>> {
    let map = [];
    let rooms: Array<AreaBox> = [];

    for (let x = 0; x < width; x++) {
        map[x] = [];
        for (let y = 0; y < height; y++) {
            map[x][y] = 0;
        }
    }

    const roomCount = this.getRandom(20, 40);
    const min_size = 4;
    const max_size = 10;

    for (let i = 0; i < roomCount; i++) {
      const roomX = this.getRandom(1, width - max_size - 1);
      const roomY = this.getRandom(1, height - max_size - 1);
      const roomWidth = this.getRandom(min_size, max_size);
      const roomHeight = this.getRandom(min_size, max_size);
        let room: AreaBox = {
          fromX : roomX,
          fromY : roomY,
          toX : roomX + roomWidth,
          toY : roomY + roomHeight
        };

        if (this.doesCollide(rooms, room)) {
            i--;
            continue;
        }
        room.toX--;
        room.toY--;

        rooms.push(room);
    }

    this.squashRooms(rooms);

    for (let i = 0; i < roomCount; i++) {
        let roomA = rooms[i];
        const roomB = this.findClosestRoom(rooms, roomA);

        const pointA = new createjs.Point(this.getRandom(roomA.fromX, roomA.toX), this.getRandom(roomA.fromY, roomA.toY));
        const pointB = new createjs.Point(this.getRandom(roomB.fromX, roomB.toX), this.getRandom(roomB.fromY, roomB.toY));

        while ((pointB.x !== pointA.x) || (pointB.y !== pointA.y)) {
            if (pointB.x !== pointA.x) {
                if (pointB.x > pointA.x) {
                  pointB.x--;
                } else {
                  pointB.x++;
                }
            } else if (pointB.y !== pointA.y) {
                if (pointB.y > pointA.y) {
                  pointB.y--;
                } else {
                  pointB.y++;
                }
            }

            map[pointB.x][pointB.y] = 1;
        }
    }

    for (let i = 0; i < roomCount; i++) {
        const room = rooms[i];
        for (let x = room.fromX; x < room.toX; x++) {
            for (let y = room.fromY; y < room.toY; y++) {
                map[x][y] = 1;
            }
        }
    }

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            if (map[x][y] === 1) {
                for (let xx = x - 1; xx <= x + 1; xx++) {
                    for (let yy = y - 1; yy <= y + 1; yy++) {
                        if (map[xx][yy] === 0) {
                          map[xx][yy] = 2;
                        }
                    }
                }
            }
        }
    }

    return map;
  }

  private  getRandom(low, high): number {
        // tslint:disable-next-line:no-bitwise
        return~~ (Math.random() * (high - low)) + low;
  }

  private findClosestRoom(rooms: Array<AreaBox>, room: AreaBox): AreaBox {
    const mid = {
        x: (room.fromX + room.toX) / 2,
        y: (room.fromY + room.toY) / 2
    };

    let closest = null;
    let closest_distance = 1000;

    for (let i = 0; i < rooms.length; i++) {
        let check = rooms[i];
        if (check === room) {
          continue;
        }

        const checkMid = {
          x: (check.fromX + check.toX) / 2,
          y: (check.fromY + check.toY) / 2
        };

        const distance = Math.min(
            Math.abs(mid.x - checkMid.x) - (room.toX - room.fromX) / 2 - (check.toX - check.fromX) / 2,
            Math.abs(mid.y - checkMid.y) - (room.toY - room.fromY) / 2 - (check.fromY - check.toY) / 2);

        if (distance < closest_distance) {
            closest_distance = distance;
            closest = check;
        }
    }

    return closest;
  }

  private squashRooms(rooms: Array<AreaBox>) {
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < rooms.length; j++) {
            let room = rooms[j];
            while (true) {
                let old_position = {
                    x: room.fromX,
                    y: room.fromY
                };

                if (room.fromX > 1) {
                  room.fromX--;
                }

                if (room.fromY > 1) {
                  room.fromY--;
                }

                if ((room.fromX === 1) && (room.fromY === 1)) {
                  break;
                }

                if (this.doesCollide(rooms, room, j)) {
                    room.fromX = old_position.x;
                    room.fromY = old_position.y;
                    break;
                }
            }
        }
    }
  }

  private doesCollide(rooms: Array<AreaBox>, currentRoom: AreaBox, ignore?: number) {
    for (let i = 0; i < rooms.length; i++) {
        if (i === ignore) {
          continue;
        }

        const check = rooms[i];
        if ( !((currentRoom.toX < check.fromX) ||
              (currentRoom.fromX > check.toX)  ||
              (currentRoom.toY < check.fromY) ||
              (currentRoom.fromY > check.toY))) {
          return true;
        }
    }

    return false;
  }
}
