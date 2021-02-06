import * as Zmq from "zeromq"
import { Push } from "zeromq";
import { Message } from "../message/Message";
import { MessageType } from "../message/MessageType.enum";
import { MessageManager } from "../message/MessageManager";

export class Worker {
    private index: number;
    private rootPort: number;
    private returnToProducerSocket: Push;

    constructor(index: number, rootPort: number){
        this.index = index
        this.rootPort = rootPort
        this.returnToProducerSocket = new Zmq.Push

        let port = this.rootPort + this.index + 1
        this.returnToProducerSocket.bind(`tcp://127.0.0.1:${port}`).then(() => {
            setTimeout(async() => {
                MessageManager.sendMessage(MessageType.WorkerConnected, `init : Worker (#${this.index}) bound to port ${port}`, this.returnToProducerSocket)
                this.run()
            }, 10) //small delay for socket binding latency
        });  
    }

    async run() {

        //init connection to queue
        const inputSock = new Zmq.Pull
        inputSock.connect("tcp://127.0.0.1:" + this.rootPort)

        //say to producer worker connection is up
        MessageManager.sendMessage(MessageType.WorkerConnected, `init : Worker (#${this.index}) listening on port ${this.rootPort}`, this.returnToProducerSocket)

        //wait for a message from producer
        for await (const [fileName] of inputSock) {
            console.timeLog('>', `worker #${this.index} recieved: ${fileName}`)
            await this.fakeTreatement(fileName.toString())  //fake treatement to add delay to worker processing
 
            MessageManager.sendMessage(MessageType.Success, fileName.toString(), this.returnToProducerSocket, this.index) //send to producer that we finished the treatement on this file    
        }
    }

    fakeTreatement(msg: string){
        return new Promise((resolve, reject) => {
            const delay = 1000; // in ms
            setTimeout(() => {
                resolve(null)
            }, delay)
        })
    }
}