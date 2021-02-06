import { Worker } from "./Worker";

export class WorkerManager {
    public workers: Worker[] = []
    
    constructor(workerCount: number, rootPort: number) {
        for (let i = 0; i < workerCount; i++) {
            this.workers.push(new Worker(i, rootPort))
        }
    }
}