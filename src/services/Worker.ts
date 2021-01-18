import * as Zmq from "zeromq"

export class Worker {
    private index: number;

    constructor(index: number){
        this.index = index
        this.run()
    }

    async run() {
        const inputSock = new Zmq.Pull
        inputSock.connect("tcp://127.0.0.1:3005")
        console.log("Worker (#%d) listening on port 3005", this.index); 

        for await (const [msg] of inputSock) {
            // Ici on opere les differents traitements etc... ici juste un delay de 1000ms dasn fakeTreatement
            await this.fakeTreatement(msg.toString())
        }
    }

    fakeTreatement(msg: string){
        return new Promise((resolve, reject) => {
            const randomDelay = 1000; // between 0ms and 1000ms
            setTimeout(() => {
                console.timeLog('>', `worker #${this.index} treating: ${msg}  t=${randomDelay}ms`)
                resolve()
            }, randomDelay)
        })
    }
}