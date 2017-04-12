import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { GameService } from '../store/services/game.service';
import { Untold } from '../shared/models/backend-export';

@Component({
  selector: 'app2-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  @Input() reset: boolean;

  selectedGame: Untold.ClientGameRealmDetails;
  model: any[]; 
  private selectedGameSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private gameService: GameService) {
    this.reset = false;
    this.selectedGame = null;
    this.updateModel();

    this.selectedGameSubscription = this.gameService.selectedGame.subscribe(game => {
      this.selectedGame = game;
      this.updateModel();
      
    });    
  }

  ngOnInit() {    
  }

  ngOnDestroy(): void {
    this.selectedGameSubscription.unsubscribe();
  }

  private updateModel() {
    const isRealmSelected = !!this.selectedGame && !!this.selectedGame.realm;
    const isCurrentUserRealmOwner = isRealmSelected && this.selectedGame.realm.isCurrentUserOwner;

    this.model = [
      {label: 'My Realms', icon: 'library_books', routerLink: ['/realms']},
      {
        label: 'Game', icon: 'games', visible: isRealmSelected,
        items: [
          {label: 'Welcome', icon: 'description', routerLink: ['/game']},
          {
            label: 'Genesis', icon: 'mode_edit', visible: isCurrentUserRealmOwner,
            items: [
              {label: 'Modules', icon: 'view_module', routerLink: ['/game/modules']},
              {label: 'Rule tables', icon: 'content_copy', routerLink: ['/game/ruletables']},
              {label: 'Definitions', icon: 'layers', routerLink: ['/game/definitions']},
              {label: 'Templates', icon: 'crop_paste', routerLink: ['/game/templates']},
              {label: 'Enitites', icon: 'person_pin', routerLink: ['/game/entities']}
            ]
          },
          {label: 'Images', icon: 'image', routerLink: ['/game/images'], visible: isCurrentUserRealmOwner},
          {label: 'Maps', icon: 'map', routerLink: ['/game/maps'], visible: isCurrentUserRealmOwner},
          {label: 'Board', icon: 'tab', routerLink: ['/game/board']}
        ]
      },
    ];

    this.changeDetectorRef.markForCheck();
  }
}
