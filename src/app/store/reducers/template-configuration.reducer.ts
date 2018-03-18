import {ActionReducer, Action} from '@ngrx/store';
import {TemplateConfigurationActions} from '../actions/template-configuration.actions';
import {TemplateConfiguration} from '../models/template-configuration';

export function TemplateConfigurationReducer(state = [], action) {
    switch (action.type) {
        case TemplateConfigurationActions.SET_TEMPLATECONFIGURATION:
            return action.payload;
        default:
            return state;
    }
}
