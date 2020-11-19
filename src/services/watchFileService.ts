import fs from "fs";
import path from "path";
import { FileSystemService } from "./fileSystemService"
import { FileContent } from "../models/FileContent";
import { AddDateTreatement } from "../treatments/addDateTreatement";
import { ConcatMessageTreatement } from "../treatments/concatMessageTreatement";
import { Logger, OutputMode } from "../utils/logger";

export class WatchFileService {

    filesPath: string
    doWatch: boolean
    
    readMode = 'utf-8'

    constructor(path: string = '') {
        this.filesPath = path
        this.doWatch = false
    }


    async startWatch() {
        Logger.out("Start", OutputMode.PRIMARY);
        this.doWatch = true
        this.loop()
    }

    loop() {         
        setTimeout(async () => { 
            const foundFileNames: string[] = await FileSystemService.scanFiles(this.filesPath)
            if(foundFileNames && foundFileNames.length > 0){
                Logger.out(`- Found ${foundFileNames.length} files`, OutputMode.PRIMARY);
                try {
                    await this.applyTreatements(foundFileNames)
                } catch (error) {
                    Logger.out(error.message, OutputMode.ERROR)
                }
            } else {
                Logger.out(`-`,OutputMode.PRIMARY);
            }
            if(this.doWatch)
                this.loop()         
        }, 3000)
    }


    applyTreatements(fileNames: string[]) {
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

    stopWatch() {
        this.doWatch = false
    }
}