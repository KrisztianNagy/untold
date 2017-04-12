import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { GameService } from '../../store/services/game.service';

@Injectable()
export class CanActivateSelectedRealmGuard implements CanActivate {

  constructor(private router: Router,
              private gameService: GameService) {}

  canActivate() {
    const hasRealm = !!this.gameService.getCurrent().realm;

    if (!hasRealm) {
     this.router.navigate(['realms']);
     return false;
    }

    return hasRealm;
  }
}
