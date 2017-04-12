import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { SignalRService } from '../shared/services/signal-r.service';
import { WebApiService } from '../shared/services/rest/web-api.service';

@Component({
  selector: 'app-connection-overlay',
  templateUrl: './connection-overlay.component.html',
  styleUrls: ['./connection-overlay.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectionOverlayComponent implements OnInit {
  display: boolean;
  displayWebApiError: boolean;
  webApiError: string;

  constructor(private signalRService: SignalRService,
              private webApiService: WebApiService,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
     this.signalRService.connectionSubject.subscribe(connection => {
      this.display = connection === false;
      this.changeDetectorRef.markForCheck();
    });

    this.webApiService.errorSubject.subscribe(msg => {
      this.displayWebApiError = true;
      this.webApiError = msg;
    });
  }

}
