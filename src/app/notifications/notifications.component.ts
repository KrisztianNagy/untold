import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { NotificationDataService } from '../shared/services/rest/notification-data.service';
import { NotificationTemplateService } from '../shared/services/notification-template.service';
import { Untold } from '../shared/models/backend-export';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  pagedNotifications: Untold.ClientPagedNotifications;
  selectedNotification: Untold.ClientNotification;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private notificationDataService: NotificationDataService,
              private notificationTemplateService: NotificationTemplateService) {
      this.pagedNotifications = <Untold.ClientPagedNotifications> {};

      this.loadNotifications();
  }

  ngOnInit() {
  }

  deleteSelectedNotification() {
    this.notificationDataService.deleteNotification(this.selectedNotification.id).subscribe(() => {
      this.loadNotifications();
    });
  }

  private loadNotifications() {
     this.notificationDataService
      .getPagedNotifications(this.pagedNotifications.currentPage ? this.pagedNotifications.currentPage : 1)
      .subscribe(paged => {
        this.pagedNotifications = paged;

        this.pagedNotifications.notifications.forEach(not => {
          (<any>not).view = this.notificationTemplateService.replaceTokens(not);
        });

        this.changeDetectorRef.markForCheck();
      });
  }
}
