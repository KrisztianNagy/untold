import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/first';

import { UserDataService } from '../../../../shared/services/rest/user-data.service';
import { TokenService } from '../../../../store/services/token.service';
import { Token } from '../../../../store/models/token';
import { Untold } from '../../../../shared/models/backend-export';

@Component({
  selector: 'app-edit-token',
  templateUrl: './edit-token.component.html',
  styleUrls: ['./edit-token.component.css']
})
export class EditTokenComponent implements OnInit, OnDestroy {
  id: number;
  busy: boolean;
  clientToken: Untold.ClientToken;
  token: Token;
  userResults: Array<any>;
  private sub: any;

  constructor(private userDataService: UserDataService,
              private tokenService: TokenService) {

  }

  ngOnInit() {
    this.sub = this.tokenService.selectedToken.subscribe(token => {
      this.token = token;
    });
  }

   ngOnDestroy() {
    this.sub.unsubscribe();
  }

  searchMember(event) {
    this.userDataService.searchUsers(event.query).first().forEach(response => {
      this.userResults = response;
    });
  }

  saveToken() {
    if (this.token) {
      this.token.loadedImage = null;
      this.tokenService.updateToken(this.token, true);
    }
  }

}
