import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Inject, forwardRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { first } from 'rxjs/operators';

import { NotificationDataService } from '../../shared/services/rest/notification-data.service';
import { NotificationTemplateService } from '../../shared/services/notification-template.service';
import { Untold } from '../../shared/models/backend-export';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[app-top-bar-notification]',
  templateUrl: './top-bar-notification.component.html',
  styleUrls: ['./top-bar-notification.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarNotificationComponent implements OnInit, OnDestroy {
  notifications: Array<Untold.ClientNotification>;
  unread: number;

  private authenticationSubscription;

  constructor(@Inject(forwardRef(() => AppComponent)) public app: AppComponent,
              private changeDetectorRef: ChangeDetectorRef,
              private notificationDataService: NotificationDataService,
              private notificationTemplateService: NotificationTemplateService,
              private router: Router) {
    this.notifications = [];
    this.unread = 0;
  }

  ngOnInit() {
    this.loadNotifications();
  }

  ngOnDestroy() {
    this.authenticationSubscription.unsubscribe();
  }

  openNotificationsPage() {
    this.router.navigateByUrl('notifications');
  }

  openActionPage(notification: Untold.ClientNotification) {
    this.notificationDataService.
      readNotification(notification.id).
      pipe(first()).
      forEach(() => {
          this.loadNotifications();
          this.notificationTemplateService.openActionPage(notification);
    });
  }

  private loadNotifications() {
     this.notificationDataService.
      getRecentNotifications().
      pipe(first()).
      forEach(recent => {
        this.notifications = recent.recentNotifications;
        this.unread = recent.unreadCount;

        this.notifications.forEach(not => {
          (<any>not).view = this.notificationTemplateService.replaceTokens(not);
        });

        this.changeDetectorRef.markForCheck();
      });
  }
}
