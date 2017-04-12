import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class GrowlService {
  messageSubject: Subject<any>;

  constructor() {
    this.messageSubject = new Subject<any>();
  }

  addInfo(summary: string, detail: string) {
    this.addMessage('info', summary, detail);
  }

  addSuccess(summary: string, detail: string) {
    this.addMessage('success', summary, detail);
  }

  addWarn(summary: string, detail: string) {
    this.addMessage('warn', summary, detail);
  }

  addError(summary: string, detail: string) {
    this.addMessage('error', summary, detail);
  }

  private addMessage(severity: string, summary: string, detail: string) {
    this.messageSubject.next({
      severity: severity,
      summary: summary,
      detail: detail
    });
  }

}
