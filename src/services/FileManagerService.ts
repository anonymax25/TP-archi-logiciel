import fs from "fs";
import path from "path";
import { FileSystemHelper } from "./FileSystemHelper"
import { AddDateTreatement } from "../treatments/addDateTreatement";
import { ConcatMessageTreatement } from "../treatments/concatMessageTreatement";
import { Logger, OutputMode } from "../utils/logger";
import * as Zmq from "zeromq"
import { Push } from "zeromq";
import { WorkerManager } from "./WorkerManager";
import { Observable } from "rxjs";
  
export class FileManagerService {

    filesPath: string
    doWatch: boolean

    foundFiles: string[] = []
    
    readMode = 'utf-8'
    workerManager: WorkerManager;

    sock: Push;
    producerListenSocket: Zmq.Pull = new Zmq.Pull;

    constructor(path: string = '') {
        this.filesPath = path
        this.doWatch = false
        this.workerManager = new WorkerManager(4)

        this.sock = new Zmq.Push;
        this.sock.bind("tcp://127.0.0.1:3005").then(() => {
            console.log("Producer bound to port 3005"); 
            this.startWatch()
        });  
    }


    async startWatch() {    
        console.time('>')
        console.timeLog('>', "Start File Watching")
        this.doWatch = true
        this.loop()
    }

    loop() {         
        setTimeout(async () => {             
            const foundFileNames: string[] = await FileSystemHelper.scanFiles(this.filesPath)
            
            for(let file of foundFileNames){
                await this.sock.send(file)
            }
            if(foundFileNames && foundFileNames.length > 0){
                console.timeLog('>', `--------- Found ${foundFileNames.length} files ---------`)
            } else {
                Logger.out(`-`,OutputMode.PRIMARY);
            }
            if(this.doWatch)
                this.loop()         
        }, 3005)
    }


    /*applyTreatements(fileNames: string[]) {
        return new Promise((resolve, reject) => {
            for (let fileName of fileNames) {
                fs.readFile(path.join(this.filesPath, fileName), this.readMode, async (err, data) =>{
                    if (err) return reject(err);

                    let fileContent: FileContent = JSON.parse(data)
                    fileContent = await new AddDateTreatement().treatFile(fileContent)
                    fileContent = await new ConcatMessageTreatement().treatFile(fileContent)

                    Logger.out(fileName + ' treated', OutputMode.NORMAL);

                    this.saveTreatment(fileName, fileContent)
                })
            }
            resolve()
        })
    }

    saveTreatment(fileName: string, fileContent: FileContent) {
        let writeFileCallback = (err: NodeJS.ErrnoException | null) => {
            if (err) throw err;
            Logger.out(fileName + ' saved');
            FileSystemService.deleteFile(this.filesPath, fileName);
        }
        FileSystemService.writeFile(
            JSON.stringify(fileContent, null, 2),
            path.join(this.filesPath, "../files_treated",fileName),
            writeFileCallback
        );  
    }
    */

    stopWatch() {
        this.doWatch = false
    }
}