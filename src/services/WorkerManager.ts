import { Worker } from "./Worker";

export class WorkerManager {
    workers: Worker[] = []
    constructor(workerCount: number){
        for (let i = 0; i < workerCount; i++) {
            this.workers.push(new Worker(i))
        }
    }
}