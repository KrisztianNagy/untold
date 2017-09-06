import { ErrorHandler, Injector, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';

import { RouteVariables } from '../../app.routes';

@Injectable()
export class UntoldErrorHandler implements ErrorHandler {
  constructor(private inj: Injector/*,
  private router: Router*/) {}

  handleError(error) {
      if (error.ngDebugContext && error.ngDebugContext.component.handleRuntimeError) {
        error.ngDebugContext.component.handleRuntimeError(error);
      }
      console.error(error.message);

     // if(RouteVariables.hasRootError) {
        let router = this.inj.get(Router);
        router.navigated = false;
        router.resetConfig(routes);
        router.navigate(['realms']);
      //}

      //this.router.navigate(['realms']);

      //(<any>window).appInsights.trackException(error);
  }
}


