import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { GameService } from '../../store/services/game.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-realm-welcome',
  templateUrl: './realm-welcome.component.html',
  styleUrls: ['./realm-welcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealmWelcomeComponent implements OnInit, OnDestroy {
  game: Untold.ClientGameRealmDetails;
  memberCount: number;
  onlineCount: number;

  private gameSubscription;
  constructor(private changeDetectorRef: ChangeDetectorRef,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService) {
  }

  ngOnInit() {
    this.game = this.gameService.getCurrent();
    this.gameSubscription = this.gameService.selectedGame.subscribe(game => {
      this.game = game;

      this.memberCount = game.members.length;
      this.onlineCount = game.members.filter(mem => {
        return mem.isOnline;
      }).length;

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.gameSubscription.unsubscribe();
  }

  disconnect() {
    this.realmHubSenderService.leaveRealm(this.game.realm.id);
  }
}
