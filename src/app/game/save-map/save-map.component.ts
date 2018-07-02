import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { MapDataService } from '../../shared/services/rest/map-data.service';
import { GameService } from '../../store/services/game.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-save-map',
  templateUrl: './save-map.component.html',
  styleUrls: ['./save-map.component.css']
})
export class SaveMapComponent implements OnInit, OnDestroy {

  id: number;
  busy: boolean;
  clientMap: Untold.ClientMap;

  private sub: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private mapDataService: MapDataService,
              private gameService: GameService) {

  }

  ngOnInit() {
    this.busy = true;
    this.clientMap = <Untold.ClientMap> {};

    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = parseInt(params['id'], 10);
        this.mapDataService.getMapById(this.id).pipe(first()).forEach(map => {
          this.clientMap = map;
          this.busy = false;
        });
      } else {
        this.busy = false;
      }
    });
  }

  save() {
    if (this.busy) {
      return;
    }

    if (!this.clientMap.reamId) {
      this.clientMap.reamId = this.gameService.getCurrent().realm.id;
    }

    const callSub = this.clientMap.id ?
      this.mapDataService.saveMap(this.clientMap) :
      this.mapDataService.createMap(this.clientMap);

    this.busy = true;
    callSub.pipe(first()).forEach(response => {
      if (response.ok) {
        this.router.navigateByUrl('/game/maps');
      }
      this.busy = false;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
