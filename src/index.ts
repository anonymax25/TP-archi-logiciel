import path from "path";
import { FileWatcher } from "./file/FileWatcher"

const FILES_LOCATION = path.join(__dirname, "../assets/files_watcher")
const ROOT_PORT = 3005 // port producer will send files

new FileWatcher(FILES_LOCATION, ROOT_PORT)