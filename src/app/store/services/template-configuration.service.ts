import { Injectable } from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {AppStore} from '../app-store';
import {TemplateConfiguration} from '../models/template-configuration';
import {TemplateConfigurationActions} from '../actions/template-configuration.actions';

@Injectable()
export class TemplateConfigurationService {
  private current: TemplateConfiguration;
  templateConfiguration: Observable<TemplateConfiguration>;

  constructor(private store: Store<AppStore>) {
    this.templateConfiguration = this.store.select(s => s.TemplateConfiguration);

    this.templateConfiguration.subscribe(temp => {
      this.current = temp;
    });
  }

  update(interaction: TemplateConfiguration) {
    this.store.dispatch({ type: TemplateConfigurationActions.SET_TEMPLATECONFIGURATION, payload: interaction });
  }

  getCurrent(): TemplateConfiguration {
    return this.current;
  }
}
