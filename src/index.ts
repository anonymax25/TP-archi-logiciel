import path from "path";
import { WatchFileService } from "./services/watchFileService";

const FILES_LOCATION = path.join(__dirname, "../assets/files_watcher")

let watchFileService = new WatchFileService(FILES_LOCATION)
watchFileService.startWatch()