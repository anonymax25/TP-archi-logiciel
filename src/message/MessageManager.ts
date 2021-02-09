import { Pull, Push } from "zeromq";
import { Message } from "./Message";
import { MessageType } from "./MessageType.enum";

export class MessageManager {

    static async sendMessage(type: MessageType, value: string, socket: Push, worker: number = -1) {
        if(type === MessageType.Success){
            console.timeLog('>', `worker #${worker} finished: ${value}`)
        }
        let message = new Message(type, value, worker)
        let messageString = JSON.stringify(message)
        await socket.send(messageString)    
    }

    static async waitRecieveMessage(socket: Pull): Promise<Message> {
        return new Promise(async (resolve, reject) => {
            try {
                let message = JSON.parse((await socket.receive()).toString()) as Message
                resolve(message)
            } catch (error) {
                reject(new Message(MessageType.Error, "message recieved failed to be parsed: " + error.message || 'no error message'))
            }
        })
    }
}