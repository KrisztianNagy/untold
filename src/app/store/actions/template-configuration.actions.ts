import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

import {TemplateConfiguration} from '../models/template-configuration';

@Injectable()
export class TemplateConfigurationActions {

    static SET_TEMPLATECONFIGURATION = 'SET_TEMPLATECONFIGURATION';
    setInteraction(templateConfiguration: TemplateConfiguration): Action {
        return <Action> {
            type: TemplateConfigurationActions.SET_TEMPLATECONFIGURATION,
            payload: templateConfiguration
        };
    }
}
