import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, NgZone,
         ViewChild, ElementRef } from '@angular/core';

import { MenuItem } from 'primeng/primeng';

import { Untold} from '../shared/models/backend-export'
import { ChatEntryService } from '../store/services/chat-entry.service';
import { GameService } from '../store/services/game.service';
import { GameWorkflowChatService } from '../shared/services/game-flow/game-workflow-chat.service';
import { ChatEntry, ChatEntryMessage, ChatEntryMessagePart } from '../store/models/chat-entry';

@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  groupedEntries: Array<Array<ChatEntry>>;
  message: string;
  selectedCommand: ChatEntryMessagePart;
  sendOptions: MenuItem[];
  private chatSubscription;

  constructor(private chatEntryService: ChatEntryService,
              private changeDetectorRef: ChangeDetectorRef,
              private gameService: GameService,
              private gameWorkflowChatService: GameWorkflowChatService,
              private ngZone: NgZone) {
    this.groupedEntries = [];
    this.message = '';
    this.selectedCommand = null;
  }

  ngOnInit() {
    const game = this.gameService.getCurrent();
    const otherMembers = game.members.filter(member => member.user.id !== game.localMembership.user.id);

    this.sendOptions = [
      {label: 'Secret', icon: 'ui-icon-security', command: () => {
        this.send(null, true);
      }}
    ];

    this.sendOptions = [...this.sendOptions, ...otherMembers.map(member => {
      return  {label: member.user.displayName, icon: 'ui-icon-person-pin', command: () => {
        this.send([member.user.id]);
      }};
    })];

    this.chatSubscription = this.chatEntryService.chat.subscribe(entries => {
      this.ngZone.run(() => this.refreshEntries(entries));
    });
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  send(whisperToId?: Array<number>, secret?: boolean) {
    if (this.message) {
      this.gameWorkflowChatService.sendMessage(this.message, whisperToId, secret);
      this.message = '';
      this.changeDetectorRef.markForCheck();
    }
  }

  refreshEntries(entries: ChatEntry[]) {
    entries = JSON.parse(JSON.stringify(entries));
    const hasUnread = entries.some(entry => !entry.isRead);
    const currentUserId = this.gameService.getCurrent().localMembership.user.id;

    if (hasUnread) {
      this.chatEntryService.marAsRead();
      return;
    }

    let previousUserId = 0;
    this.groupedEntries = [];
    let lastGroup: Array<ChatEntry>;

    entries = entries.filter(entry => {
      if (!entry.message.isWhisper && !entry.message.secret) {
        return true;
      }

      if (entry.message.isWhisper && entry.message.whisperToIds.indexOf(currentUserId) > -1) {
        return true;
      }

      if (entry.message.secret && entry.message.senderId === currentUserId) {
        return true;
      }

      return false;
    });

    entries.forEach(entry => {
      entry.message.messageParts = entry.sentByMe ? entry.message.messageParts.reverse() : entry.message.messageParts;

      if (entry.message.senderId === previousUserId) {
        lastGroup = [...lastGroup, entry];
      } else {
        if (lastGroup) {
          this.groupedEntries = [...this.groupedEntries, lastGroup];
        }

        lastGroup = [entry];
        previousUserId = entry.message.senderId;
      }
    });

    if (lastGroup) {
      this.groupedEntries = [...this.groupedEntries, lastGroup];
    }

    this.changeDetectorRef.detectChanges();
  }

  changeView(part: ChatEntryMessagePart) {
      part.switch = !part.switch;
      this.changeDetectorRef.markForCheck();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {

    }
  }

}
