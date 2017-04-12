import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Untold } from '../models/backend-export';

@Injectable()
export class NotificationTemplateService {
  templates: any;

  constructor(private router: Router) {
    this.populateTemplates();
  }

  openActionPage(notification: Untold.ClientNotification) {
    switch (notification.notificationTypeId) {
      case 'RMCRT':
          this.router.navigateByUrl('');
          break;
      case 'RMINV':
          this.router.navigateByUrl('');
          break;
      case 'RMAPP':
          this.router.navigateByUrl('');
          break;
      case 'RMREJ':
          this.router.navigateByUrl('');
          break;
      case 'RMRFT':
          this.router.navigateByUrl('');
          break;
      default:
        break;
    }
  }

  replaceTokens(notification: Untold.ClientNotification) {
    let template: string = this.templates[notification.notificationTypeId];
    const tokens = <any>JSON.parse(notification.data);

    let placeholders = [];
    let start = 0;

    // Getting the placeholders
    while (true) {
      start = template.indexOf('[', start);

      if (start === -1) {
        break;
      }

      const end = template.indexOf(']', start);

      if (end === -1) {
        break;
      }

      placeholders.push(template.substring(start + 1, end));
      start = end;
    }

    placeholders.forEach(ph => {
      const hierarchy = ph.split('.');
      let curr = tokens;
      hierarchy.forEach(token => {
        if (curr.hasOwnProperty(token)) {
         curr = curr[token];
        } else {
          return;
        }
      });
      template = template.replace('[' + ph + ']', curr);
    });

    if (!notification.isRead) {
      template = '<b>' + template + '</b>';
    }

    return template;
  }

  private populateTemplates() {
    this.templates = {
      RMCRT: '[name] has been created.',
      RMINV: 'Realm invitation from [realm.name].',
      RMAPP: '[user.userName] accepted your invitation.',
      RMREJ: '[user.userName] rejected your invitation.',
      RMLFT: '[user.userName] left your realm.'
    };
  }
}
