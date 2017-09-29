import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Router} from '@angular/router';
import 'rxjs/add/operator/first';

import {PanelModule} from 'primeng/primeng';

import { RealmHubSenderService } from '../shared/services/realm-hub-sender.service';
import { AuthService } from '../shared/services/auth.service';
import { RealmHubListenerService } from '../shared/services/realm-hub-listener.service';
import { RealmDataService } from '../shared/services/rest/realm-data.service';
import { Untold } from '../shared/models/backend-export';
import { UserRealmMembershipStates } from '../shared/constants/user-realm-membership-states-constants';

@Component({
  selector: 'app-my-realms',
  templateUrl: './my-realms.component.html',
  styleUrls: ['./my-realms.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyRealmsComponent implements OnInit, OnDestroy {
  myCreatedRealms: Array<Untold.ClientRealm>;
  selectedCreatedRealm: Untold.ClientRealm;
  myPlayerRealms: Array<Untold.ClientUserRealmMembership>;
  selectedPlayerRealm: Untold.ClientUserRealmMembership;
  busy: boolean;

  private responseJoinRealmSubscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private realmDataService: RealmDataService,
              private router: Router,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private authService: AuthService) {
  }

  ngOnInit() {

    this.authService.ready.subscribe(() => {
      if (this.authService.authenticated()) {
        this.loadMyCreatedRealms();
        this.loadMyPlayerRealms();

        this.responseJoinRealmSubscription = this.realmHubListenerService.responseJoinRealm.subscribe(rm => {
          this.router.navigateByUrl('game');
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.responseJoinRealmSubscription) {
      this.responseJoinRealmSubscription.unsubscribe();
    }
  }

  deleteSelectedRealm() {
    if (this.selectedCreatedRealm) {
      this.busy = true;
      this.realmDataService.deleteRealm(this.selectedCreatedRealm.id).
        subscribe(() => {
          this.busy = false;
          this.loadMyCreatedRealms();
      });
    }
  }

  start(realm) {
    this.busy = true;

    this.realmHubSenderService.joinRealm(realm.id).subscribe(() => {
      this.busy = false;
    });
  }

  approveSelectedRealm() {
    this.busy = true;

    this.realmDataService.joinApprove(this.selectedPlayerRealm.realm.id).
        subscribe(() => {
          this.busy = false;
          this.loadMyPlayerRealms();
      });
  }

  rejectSelectedRealm() {
    this.busy = true;
    this.realmDataService.joinReject(this.selectedPlayerRealm.realm.id).
        subscribe(() => {
          this.busy = false;
          this.loadMyPlayerRealms();
      });
  }

  leaveSelectedRealm() {
    this.busy = true;
    this.realmDataService.leave(this.selectedPlayerRealm.realm.id).
        subscribe(() => {
          this.busy = false;
          this.loadMyPlayerRealms();
      });
  }

  private loadMyCreatedRealms() {
    this.realmDataService.getMyCreatedRealms().subscribe(realms => {
      this.myCreatedRealms = realms.map((realm: any) => {
        try {
          realm.createdString = new Date(realm.created).toDateString();
        } catch (ex) {
          realm.createdString = '';
        }
        return realm;
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  private loadMyPlayerRealms() {
    this.realmDataService.getMyPlayerRealms().subscribe(realms => {
      this.myPlayerRealms = realms;
      this.myPlayerRealms.forEach(rm => {

          if (rm.stateId === UserRealmMembershipStates.Joined) {
            (<any>rm).state = 'Joined';
          } else if (rm.stateId === UserRealmMembershipStates.Invited) {
            (<any>rm).state = 'Invited';
          } else {
            (<any>rm).state = rm.stateId;
          }
        });

        this.changeDetectorRef.markForCheck();
    });
  }
}
