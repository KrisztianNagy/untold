import { Component, OnInit } from '@angular/core';

import {WallService} from '../../../store/services/wall.service';

@Component({
  selector: 'app-wall-drawing',
  templateUrl: './wall-drawing.component.html',
  styleUrls: ['./wall-drawing.component.css']
})
export class WallDrawingComponent implements OnInit {

  constructor(private wallService: WallService) { }

  ngOnInit() {
  }

  undo() {
    const userWalls = this.wallService.getCurrentUserWalls();
    if (userWalls.length > 0) {
      this.wallService.deleteUserWall(userWalls[userWalls.length - 1]);
    }
  }
}
