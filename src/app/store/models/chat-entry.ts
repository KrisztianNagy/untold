export class ChatEntry {
    epoc: number;
    isRead: boolean;
    sentByMe: boolean;
    senderName: string;
    message: ChatEntryMessage
}

export class ChatEntryMessage {
    messageParts: Array<ChatEntryMessagePart>;
    isWhisper: boolean;
    senderId: number;
    whisperToIds: Array<number>;
    secret: boolean;
}

export class ChatEntryMessagePart {
    message: string;
    type: string;
    command: string;
    switch?: boolean;
}
