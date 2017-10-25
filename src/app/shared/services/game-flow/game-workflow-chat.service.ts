import { Injectable } from '@angular/core';

import { RealmHubSenderService } from '../realm-hub-sender.service';
import { RealmHubListenerService } from '../realm-hub-listener.service';
import { Untold } from '../../models/backend-export';
import { GenesisDataService } from '../../../shared/services/rest/genesis-data.service';
import { SheetEnhancerService } from '../../../shared/services/expressions/sheet-enhancer.service';
import { GameService } from '../../../store/services/game.service';
import { ChatEntry, ChatEntryMessage, ChatEntryMessagePart } from '../../../store/models/chat-entry';
import { ChatEntryService } from '../../../store/services/chat-entry.service';
import { GrowlService } from '../growl.service';
import { ChatService } from '../chat.service';

@Injectable()
export class GameWorkflowChatService {

  private lastLoadPoint: number;

  constructor(private genesisDataService: GenesisDataService,
              private gameService: GameService,
              private realmHubSenderService: RealmHubSenderService,
              private realmHubListenerService: RealmHubListenerService,
              private sheetEnhancerService: SheetEnhancerService,
              private growlService: GrowlService,
              private chatEntryService: ChatEntryService,
              private chatService: ChatService) {
    this.realmHubListenerService.responseNewMessage.subscribe(resp => {
      this.loadMessages();
    });
  }

  sendMessage(message: string, whisperToIds: Array<number>, secret: boolean) {
    const userId = this.gameService.getCurrent().localMembership.user.id;

    const chatEntry: ChatEntryMessage = {
      messageParts: this.chatService.createMessageParts(message),
      isWhisper: whisperToIds && whisperToIds.length ? true : false,
      senderId: userId,
      whisperToIds: whisperToIds ? whisperToIds : [],
      secret: secret
    }

    this.chatService.sendMessage(this.gameService.getCurrent(), chatEntry).subscribe(() => {
      this.realmHubSenderService.newMessage(this.gameService.getCurrent().realm.id);
    });
  }

  loadMessages() {
    this.lastLoadPoint = this.lastLoadPoint ? this.lastLoadPoint : (new Date()).getTime() - 10000000;

    this.chatService.getMessages(this.gameService.getCurrent(), this.lastLoadPoint).subscribe(entries => {
      entries.forEach(entry => {
        this.chatEntryService.addChatEntry(entry);
      });

      if (entries.length) {
        this.lastLoadPoint = entries.splice(-1)[0].epoc;
      }
    });
  }
}
