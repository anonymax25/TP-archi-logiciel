import { FileSystemHelper } from "./FileSystemHelper"
import { Logger, OutputMode } from "../utils/Logger";
import * as Zmq from "zeromq"
import { Pull, Push } from "zeromq";
import { WorkerManager } from "../worker/WorkerManager";
import { resolve } from "path";
import { Message } from "../message/Message";
import { MessageType } from "../message/MessageType.enum";
import { MessageManager } from "../message/MessageManager";

export class FileWatcher {

    filesPath: string
    doWatch: boolean

    foundFiles: string[] = []

    readMode = 'utf-8'
    workerManager: WorkerManager;
    rootPort: number

    producerQueue: Push = new Push;
    workerCallbackQueue: Pull = new Pull;

    constructor(path: string = '', rootPort: number, workerCount: number = 4) {
        this.rootPort = rootPort
        this.filesPath = path
        this.doWatch = false
        this.workerManager = new WorkerManager(workerCount, this.rootPort)

        //bind producer to his queue
        this.producerQueue.bind(`tcp://127.0.0.1:${this.rootPort}`).then(() => {
            console.log("init : Producer bound to port " + this.rootPort);
            this.initListeningToWorker().then(() => {
                this.startWatch() //start watching the directory
            }) 
        });
    }
            
    //set queues to listen if workers have finished tasks
    async initListeningToWorker() {
        const workerCount = this.workerManager.workers.length
        for (let i = 0; i < workerCount; i++) {
            let port = this.rootPort + i + 1
            this.workerCallbackQueue.connect(`tcp://127.0.0.1:${port}`);
            console.log("init : Producer listening on port " + port);
        }
        let count = workerCount * 2
        while(count > 0){
            let message: Message = await MessageManager.waitRecieveMessage(this.workerCallbackQueue) // listen to the queues the workers signal they have started running
            if(message.type === MessageType.WorkerConnected){
                console.log(message.value);
                count--
            }else{
                throw new Error("A worker couldn't start")
            }
        }
        console.log(`init : producer and (${workerCount}/${workerCount}) workers initialized`);
        
    }

    // starts the loop sequence to watch the directory for files
    async startWatch() {
        console.time('>')
        console.log("Start File Watching")
        this.doWatch = true
        this.loop()
    }


    loop() {
        setTimeout(async () => {

            // find files in the watched directory      
            let foundFileNames: string[] = await FileSystemHelper.scanFiles(this.filesPath)
            if (foundFileNames && foundFileNames.length > 0) {
                console.timeLog('>', `--------- Found ${foundFileNames.length} files ---------`)
            } else {
                Logger.out(`waiting files...`);
            }

            //send filenames in the message queue to be consumed by the workers
            for (let filename of foundFileNames) {
                await this.producerQueue.send(filename)
            }

            // wait for the workers to respond that they treated the files or that the treatement of a file has an error
            await this.waitResponseFromWorkers(foundFileNames)

            if (this.doWatch)
                this.loop()
        }, 3000) // delay for file search loop
    }

    stopWatch() {
        this.doWatch = false
    }

    async waitResponseFromWorkers(foundFileNames: string[]) {
        let total = foundFileNames.length
        while (foundFileNames.length) {
            let message: Message = await MessageManager.waitRecieveMessage(this.workerCallbackQueue) // listen to the queues the workers signal a file has been treated
            if(message.type === MessageType.Success){
                let treatedFileName = message.value
                console.timeLog('>', `producer: recieved (from worker #${message.worker}) ${treatedFileName} treated (${total - foundFileNames.length + 1}/${total})`)  // log that a worker has sent back the name of a finished file
                await FileSystemHelper.deleteFile(this.filesPath, treatedFileName)          // remove the file that we treated from the list
                foundFileNames = foundFileNames.filter(name => name != treatedFileName)     // remove the file that we treated from the list
            } else if(message.type === MessageType.LogInfo) {
                console.log(message.value);
            }
        }
    }

}