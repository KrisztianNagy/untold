import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {WallService} from '../../../store/services/wall.service';
import {VisibleAreaService} from '../../../store/services/visible-area.service';
import {TokenService} from '../../../store/services/token.service';
import {RenderService} from '../services/render.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
  private display = true;

  constructor(private wallService: WallService,
              private visibleAreaService: VisibleAreaService,
              private tokenService: TokenService,
              private renderService: RenderService) {

  }

  ngOnInit() {
  }

}
