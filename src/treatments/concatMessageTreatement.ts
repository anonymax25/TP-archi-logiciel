import { FileContent } from "../models/FileContent";
import { Treatement } from "../interfaces/treatment.interface";

export class ConcatMessageTreatement implements Treatement {
    treatFile(fileContent: FileContent): Promise<FileContent> {
        return new Promise((resolve, reject) => {
            const randomDelay = Math.random() * 1000; // between 0ms and 1000ms
            setTimeout(() => {
                try {
                    fileContent.message += ` ${fileContent.message}`
                    resolve(fileContent)
                } catch (e) {
                    reject(e.message)
                }
            }, randomDelay)
        })
    }
}