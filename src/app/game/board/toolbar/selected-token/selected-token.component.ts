import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import {Token} from '../../../../store/models/token';
import {TokenService} from '../../../../store/services/token.service';
import {GameService} from '../../../../store/services/game.service';
import {Untold} from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-selected-token',
  templateUrl: './selected-token.component.html',
  styleUrls: ['./selected-token.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedTokenComponent implements OnInit {
  selectedToken: Token;
  tokens: Array<Token>;
  selectedPos: number;

  constructor(private tokenService: TokenService,
              private gameService: GameService) {
    this.selectedToken = null;
    this.tokens = [];

    this.tokenService.selectedToken.
      merge(this.tokenService.tokens).
      subscribe(() => {
        this.resetCarousel();
      });
  }

  ngOnInit() {
  }

  private resetCarousel() {
    const game = this.gameService.getCurrent();

    this.tokens = this.tokenService.getCurrent().filter(token => {
      return game.realm.isCurrentUserOwner || (token.owner && token.owner.id === game.localMembership.id);
    });

    this.selectedToken = JSON.parse(JSON.stringify(this.tokenService.getCurrentSelectedToken()));

    this.tokens.forEach((token, index) => {
      if (token.id === this.selectedToken.id) {
        this.selectedPos = index;
        return;
      }
    });
  }

  move(toNext: boolean) {
    let pos: number;

    if (toNext) {
      pos = this.tokens.length > this.selectedPos ? this.selectedPos + 1 : 0;
    } else {
      pos =  0 === this.selectedPos ? this.tokens.length - 1 : this.selectedPos - 1;
    }

    this.tokenService.selectTokenById(this.tokens[pos].id);
  }

  update() {
    this.tokenService.updateToken(this.selectedToken, true);
  }

  remove() {
    this.tokenService.selectTokenById(-1);
  }

  changeLayer(id: number) {
    this.selectedToken.layer = id;
    this.tokenService.updateToken(this.selectedToken, true);
    this.tokenService.selectTokenById(-1);
  }
}
