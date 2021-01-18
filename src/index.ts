import path from "path";
import { FileManagerService } from "./services/FileManagerService";

const FILES_LOCATION = path.join(__dirname, "../assets/files_watcher")

new FileManagerService(FILES_LOCATION)