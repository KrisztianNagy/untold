import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { ChatEntry } from '../models/chat-entry';

@Injectable()
export class ChatEntryActions {

    static ADD_CHAT_ENTRY = 'ADD_CHAT_ENTRY';
    static MARK_CHAT_ENTRY_AS_READ = 'MARK_CHAT_ENTRY_AS_READ';

    addChatEntry(entries: Array<ChatEntry>): Action {
        return <Action> {
            type: ChatEntryActions.ADD_CHAT_ENTRY,
            payload: entries
        };
    }

    markAsRead(entries: Array<ChatEntry>): Action {
        return <Action> {
            type: ChatEntryActions.MARK_CHAT_ENTRY_AS_READ,
            payload: entries
        };
    }
}
