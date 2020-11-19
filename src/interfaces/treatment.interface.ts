import { FileContent } from "../models/FileContent";

export interface Treatement {
    treatFile(fileContent: FileContent): Promise<FileContent>;
}