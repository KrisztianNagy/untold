import { Injectable } from '@angular/core';

import { ChatEntry, ChatEntryMessage, ChatEntryMessagePart } from '../../store/models/chat-entry';
import { DiceService } from './dice.service';
import { ChatTableRow } from '../models/data-table';
import { StorageDataService } from './rest/storage-data.service';
import { Untold } from '../models/backend-export';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Subject } from 'rxjs/Subject';

declare var LZString;

@Injectable()
export class ChatService {

  constructor(private diceService: DiceService,
              private storageDataService: StorageDataService) { }

createMessageParts(message: string): Array<ChatEntryMessagePart> {

    const messageParts: Array<ChatEntryMessagePart> = [];

    while (true) {
      const match = message.match(/(\d+)+(d)+(\d+)+(\s*)+[+-]?(\s*)(\d*)/);

      if (match) {
        if (match.index > 0) {
          const trailingText = message.substr(0, match.index);

          messageParts.push({
            message: trailingText,
            type: 'text',
            command: ''
          });
        }

        const command = message.substr(match.index, match[0].length);
        messageParts.push(this.rollDice(command));
        message = message.substr(match.index + match[0].length);
      } else {
        messageParts.push({
          message: message,
          type: 'text',
          command: ''
        });

        break;
      }
    }

    return messageParts.filter(msg => msg.message);
  }

  sendMessage(game: Untold.ClientGameRealmDetails, chatEntry: ChatEntryMessage) {
    const realm = game.realm;
    const entryString = JSON.stringify(chatEntry);
    const compressedEntry = LZString.compressToUTF16(entryString);

    const tableRow: ChatTableRow = {
      PartitionKey: 'chat',
      RowKey: (new Date()).getTime().toString(),
      rowStatus: 1,
      message: compressedEntry,
    };

    return this.storageDataService.insertOrUpdate(tableRow, 'RM' + realm.id + 'Communication', realm.communicationEditorAcccessSignature);
  }

  getMessages(game: Untold.ClientGameRealmDetails, lastLoadPoint: number): AsyncSubject<Array<ChatEntry>> {
        const subject = new AsyncSubject<Array<ChatEntry>>();

        const tableRow: ChatTableRow = {
          PartitionKey: 'chat',
          RowKey: lastLoadPoint.toString(),
          rowStatus: 1,
          message: ''
        };

        const filter = 'RowKey%20gt%20\'' + lastLoadPoint.toString() + '\'';
        // tslint:disable-next-line:max-line-length
        this.storageDataService.readFilteredRows('RM' + game.realm.id + 'Communication', game.realm.communicationReaderAcccessSignature, filter)
          .subscribe(res => {
            const rows: any = JSON.parse(res);
            let entries: Array<ChatEntry> = [];

            if (rows && rows.value) {
              entries = rows.value.map(row => {
                const compressedMessage = row['message'];
                const decompressedMessage = LZString.decompressFromUTF16(compressedMessage);
                const message: ChatEntryMessage = JSON.parse(decompressedMessage);
                const member = game.members.filter(mem => mem.user.id === message.senderId);

                const entry: ChatEntry = {
                  epoc: parseInt(row['RowKey'], 10),
                  isRead: false,
                  message: message,
                  sentByMe: member.length && member[0].user.id === game.localMembership.user.id,
                  senderName: member.length ? member[0].user.displayName : 'UNKNOWN'
                }

                return entry;
              });
            }

            subject.next(entries);
            subject.complete();
          }, err => {

            subject.next([]);
            subject.complete();
          });

          return subject;
  }

  private rollDice(diceText: string): ChatEntryMessagePart {
    try {
      const result = <Array<number>> this.diceService.roll(diceText, true);

      let sum = 0;
      result.forEach(element => sum += element);

      return {
        message: sum.toString() + ' (' + diceText + ')',
        type: 'roll',
        command: JSON.stringify(result)
      }
    } catch (err) {
      return {
        message: 'Invalid dice throw',
        type: 'roll',
        command: JSON.stringify([])
      }
    }
  }
}

