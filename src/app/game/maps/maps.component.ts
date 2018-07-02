import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { MapDataService } from '../../shared/services/rest/map-data.service';
import { GameService } from '../../store/services/game.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsComponent implements OnInit {
  myMaps: Array<Untold.ClientMap>;
  selectedMap: Untold.ClientMap;
  game: Untold.ClientGameRealmDetails;
  selectedMember: Untold.ClientUserRealmMembership;
  private gameSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private mapDataService: MapDataService,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService) {

  }

  ngOnInit() {
     this.gameSubscription = this.gameService.selectedGame.subscribe(game => {
      this.game = game;

      this.changeDetectorRef.markForCheck();
    });

    this.loadMyCreatedMaps();
  }

  deleteSelectedMap() {
    if (this.selectedMap) {
      this.mapDataService.deleteMap(this.selectedMap.id).
        subscribe(() => {
          this.loadMyCreatedMaps();
        });
    }
  }

  loadMap(map: Untold.ClientMap, member: Untold.ClientUserRealmMembership) {
    const filteredMembers = this.game.members.
      filter(mem => {
        return member ? mem.user.id === member.user.id : true;
    });

    filteredMembers.forEach(mem => {
      this.realmHubSenderService.activateMap({
        userName: mem.user.userName,
        mapId: map ? map.id : null,
        realmId: this.game.realm.id
      }).subscribe(() => {
        this.gameService.updateMemberMap(map, member);
      });
    });
  }

  private loadMyCreatedMaps() {
    this.mapDataService.getMyCreatedMaps(this.gameService.getCurrent().realm.id).subscribe(maps => {
      this.myMaps = maps;
      this.changeDetectorRef.markForCheck();
    });
  }
}
