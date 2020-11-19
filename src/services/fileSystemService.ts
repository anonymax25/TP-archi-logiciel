import path from "path";
import fs from "fs";

export class FileSystemService {
    static scanFiles(filesPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            let res: string[] = []
            const directoryPath = path.join(filesPath);
            fs.readdir(directoryPath, (err, files) => {
                if (err)
                    reject(err.message)
                resolve(files)
            })
        })
    }

    static deleteFile(filesPath: string, fileName: string) {
        fs.unlink(path.join(filesPath, fileName), function (err) {
            if (err) throw err;
            console.log(fileName + ' removed from watcher');
        });
    }

    static writeFile(content: string, path: string, callBack: (err: NodeJS.ErrnoException | null) => void) {
        fs.writeFile(path, content, callBack);
    }
}