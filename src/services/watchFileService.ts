import { rejects } from "assert"
import { resolve } from "path"
import { FileSystemService } from "./fileSystemService"
import fs from "fs";
import path from "path";
import { FileContent } from "../models/FileContent";
import { Treatement } from "../interfaces/treatment.interface";
import { AddDateTreatement } from "../treatments/addDateTreatement";
import { ConcatMessageTreatement } from "../treatments/concatMessageTreatement";

export class WatchFileService {

    filesPath: string
    doWatch: boolean
    
    readMode = 'utf-8'

    constructor(path: string = '') {
        this.filesPath = path
        this.doWatch = false
    }


    async startWatch() {
        console.log("start");
        this.doWatch = true
        this.loop()
    }

    loop() {         
        setTimeout(async () => { 
            const foundFileNames: string[] = await FileSystemService.scanFiles(this.filesPath)
            if(foundFileNames && foundFileNames.length > 0){
                console.log(`- Found ${foundFileNames.length} files`);
                await this.applyTreatements(foundFileNames)
            } else {
                console.log(`-`);

            }

            if(this.doWatch)
                this.loop()
            
        }, 3000)
    }


    applyTreatements(fileNames: string[]) {
        return new Promise((resolve, reject) => {
            for (let fileName of fileNames) {
                fs.readFile(path.join(this.filesPath, fileName), this.readMode, async (err, data) =>{
                    if (err) {
                        return reject(err);
                    }
                    let fileContent: FileContent = JSON.parse(data)

                    fileContent = await new AddDateTreatement().treatFile(fileContent)
                    fileContent = await new ConcatMessageTreatement().treatFile(fileContent)

                    console.log(fileName + ' treated');

                    let writeFileCallback = (err: NodeJS.ErrnoException | null) => {
                        if (err) throw err;
                        console.log(fileName + ' saved');
                        FileSystemService.deleteFile(this.filesPath, fileName);
                    }

                    FileSystemService.writeFile(
                        JSON.stringify(fileContent, null, 2),
                        path.join(this.filesPath, "../files_treated",fileName),
                        writeFileCallback
                    );  
                })
            }
            resolve()
        })
    }

    stopWatch() {
        this.doWatch = false
    }
}