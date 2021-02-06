import path from "path";
import fs from "fs";
import { Logger } from "../utils/Logger";

export class FileSystemHelper {
    static scanFiles(filesPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const directoryPath = path.join(filesPath);
            fs.readdir(directoryPath, (err, files) => {
                if (err)
                    reject(err.message)
                resolve(files)
            })
        })
    }

    static async deleteFile(filesPath: string, fileName: string) {
        return new Promise((resolve, reject) => {
            fs.unlink(path.join(filesPath, fileName), function (err) {
                if (err) 
                    reject(false)
                //Logger.out(fileName + ' removed from watcher');
                resolve(true)
            });
        })
    }

    static writeFile(content: string, path: string, callBack: (err: NodeJS.ErrnoException | null) => void) {
        fs.writeFile(path, content, callBack);
    }
}