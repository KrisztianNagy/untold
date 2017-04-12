import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { GameService } from '../../store/services/game.service';

@Injectable()
export class CanActivateSelectedRealmOwnerGuard implements CanActivate {

  constructor(private router: Router,
              private gameService: GameService) {}

  canActivate() {
    const selectedGame = this.gameService.getCurrent();
    const hasAccess = !!selectedGame.realm;

    if (!hasAccess) {
      this.router.navigate(['realms']);
      return false;
    }

    return true;
  }
}
