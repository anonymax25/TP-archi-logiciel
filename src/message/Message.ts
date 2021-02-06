import { MessageType } from "./MessageType.enum";

export class Message {
    constructor(public type: MessageType, public value: string, public worker: number = -1) {}
}
