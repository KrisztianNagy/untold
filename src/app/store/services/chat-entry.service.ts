import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { AppStore } from '../app-store';
import { ChatEntry } from '../models/chat-entry';
import { ChatEntryActions } from '../actions/chat-entry.actions';

@Injectable()
export class ChatEntryService {
    chat: Observable<ChatEntry[]>;
    private current: ChatEntry[];

    constructor(private store: Store<AppStore>) {
    this.chat = this.store.select(s => s.Chat);

    this.chat.subscribe(rt => {
      this.current = rt;
    });
  }

  addChatEntry(chatEntry: ChatEntry) {
    this.store.dispatch({ type: ChatEntryActions.ADD_CHAT_ENTRY, payload: chatEntry });
  }

  marAsRead() {
    this.store.dispatch({ type: ChatEntryActions.MARK_CHAT_ENTRY_AS_READ, payload: null});
  }

  getCurrent(): ChatEntry[] {
    return this.current;
  }
}
