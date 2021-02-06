export enum OutputMode {
    PRIMARY = "\u001b[1;32m",
    SECONDARY = "\u001b[1;35m",
    WARNING = "\u001b[1;33m",
    ERROR = "\u001b[1;31m",
    NORMAL = ""
}

export class Logger {
    static out(message: string, mode: OutputMode = OutputMode.NORMAL) {
        console.log(mode + message);
    }
}