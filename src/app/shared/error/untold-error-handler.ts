import { ErrorHandler } from '@angular/core';

export class UntoldErrorHandler implements ErrorHandler {
  handleError(error) {
      console.log('ERROR!');
      (<any>window).appInsights.trackException(error);
  }
}
