import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/first';

import { RealmDataService } from '../shared/services/rest/realm-data.service';
import { UserDataService } from '../shared/services/rest/user-data.service';
import { Untold } from '../shared/models/backend-export';

@Component({
  selector: 'app-save-realm',
  templateUrl: './save-realm.component.html',
  styleUrls: ['./save-realm.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveRealmComponent implements OnInit, OnDestroy {
  id: number;
  busy: boolean;
  clientRealm: Untold.ClientRealm;
  userResults: Array<any>;
  private sub: any;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private router: Router,
              private realmDataService: RealmDataService,
              private userDataService: UserDataService) {

  }

  ngOnInit() {
    this.busy = true;
    this.clientRealm = <Untold.ClientRealm> {};

    this.sub = this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = parseInt(params['id'], 10);
        this.realmDataService.getRealmById(this.id).first().forEach(realm => {
          this.clientRealm = realm;
          this.clientRealm.members = this.clientRealm.members.filter(mem => {
            return mem.userName !== this.clientRealm.owner.userName;
          });
          this.busy = false;
          this.changeDetectorRef.markForCheck();
        });
      } else {
        this.busy = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  save() {
    if (this.busy) {
      return;
    }

    const callSub = this.clientRealm.id ?
      this.realmDataService.saveRealm(this.clientRealm) :
      this.realmDataService.createRealm(this.clientRealm);

    this.busy = true;
    callSub.first().forEach(response => {
      if (response.ok) {
        this.router.navigateByUrl('');
      }

      this.busy = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  searchMember(event) {
    this.userDataService.searchUsers(event.query).first().forEach(response => {
      this.userResults = response;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
