import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {Router} from '@angular/router';

import { GameService } from '../../store/services/game.service';
import { RealmHubSenderService } from '../../shared/services/realm-hub-sender.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  selector: 'app-home-side-bar',
  templateUrl: './home-side-bar.component.html',
  styleUrls: ['./home-side-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeSideBarComponent implements OnInit, OnDestroy {
  selectedGame: Untold.ClientGameRealmDetails;
  model: any[];
  isRealmSelected: boolean;
  isCurrentUserRealmOwner: boolean;
  private selectedGameSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private router: Router,) {

    this.selectedGame = null;

    this.selectedGameSubscription = this.gameService.selectedGame.subscribe(game => {
        this.selectedGame = game;
        this.isRealmSelected = !!this.selectedGame && !!this.selectedGame.realm;
        this.isCurrentUserRealmOwner = this.isRealmSelected && this.selectedGame.realm.isCurrentUserOwner;
        this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.selectedGameSubscription.unsubscribe();
  }

  openWelcome() {
    this.router.navigateByUrl('game');
  }

  openMyRealms() {
    this.router.navigateByUrl('realms');
  }

  disconnect() {
    this.realmHubSenderService.leaveRealm(this.selectedGame.realm.id);
  }

}
