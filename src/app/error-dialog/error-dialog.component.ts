import { Component, OnInit } from '@angular/core';
import { merge } from 'rxjs/operators';

import { RealmHubSenderService } from '../shared/services/realm-hub-sender.service';
import { WebApiService } from '../shared/services/rest/web-api.service';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  display = false;
  errorMessage: string;

  constructor(private realmHubSenderService: RealmHubSenderService,
    private webApiService: WebApiService) {
    this.realmHubSenderService.errorSubject.
      pipe(merge(this.webApiService.errorSubject))
      .subscribe(err => {
        this.errorMessage = err;
        this.display = true;
      });
  }

  ngOnInit() {
  }
}
