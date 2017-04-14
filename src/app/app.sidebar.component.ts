import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, ViewChild, Inject, forwardRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/primeng';

import { AppComponent } from './app.component';
import { AppMenuComponent }  from './app.menu.component';
import { GameService } from './store/services/game.service';
import { Untold } from './shared/models/backend-export';

@Component({
    selector: 'app-sidebar',
      templateUrl: './app.sidebar.component.html'
})
export class AppSideBarComponent {
    selectedGame: Untold.ClientGameRealmDetails;
    model: any[];
    isRealmSelected: boolean;
    isCurrentUserRealmOwner: boolean;
    private selectedGameSubscription;

    constructor(@Inject(forwardRef(() => AppComponent)) public app: AppComponent,
                private changeDetectorRef: ChangeDetectorRef,
                private gameService: GameService) {
        this.selectedGame = null;

        this.selectedGameSubscription = this.gameService.selectedGame.subscribe(game => {
            this.selectedGame = game;
            this.isRealmSelected = !!this.selectedGame && !!this.selectedGame.realm;
            this.isCurrentUserRealmOwner = this.isRealmSelected && this.selectedGame.realm.isCurrentUserOwner;
            this.changeDetectorRef.markForCheck();
        });
    }
}