import { ActionReducer, Action } from '@ngrx/store';
import { ChatEntryActions } from '../actions/chat-entry.actions';
import { ChatEntry } from '../models/chat-entry';

export function ChatEntryReducer(state = [], action) {
    switch (action.type) {
        case ChatEntryActions.ADD_CHAT_ENTRY:
            return [...state, action.payload];
        case ChatEntryActions.MARK_CHAT_ENTRY_AS_READ:
            return state.map((entry: ChatEntry) => {
                entry.isRead = true;
                return entry;
            });
        default:
            return state;
    };
}
