import path from "path";
import { FileWatcher } from "./file/FileWatcher"

const args = process.argv.slice(2)

const FILES_LOCATION = path.join(__dirname, "../assets/files_watcher")
const ROOT_PORT = 3005 // port producer will send files
const WORKER_COUNT = parseInt(args.shift() || '4')
console.log(WORKER_COUNT);


new FileWatcher(FILES_LOCATION, ROOT_PORT, WORKER_COUNT)