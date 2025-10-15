import express, { Router } from 'express';
import cors from 'cors';

interface Options {
    port: number;
    routes: Router;
}

export class Server {
    private app = express(); 
    private readonly port: number;
    private readonly routes: Router;

    constructor(options: Options) {
        const { port, routes } = options;
        this.port = port;
        this.routes = routes;
    }
    
    async start() {
        this.app.use(cors());
        this.app.use(express.static('public')); 
        this.app.use(express.json());
        this.app.use(express.urlencoded());
        this.app.use(this.routes);

        // this.app.get('/api/users', (req, res) => {
        //     res.json([
        //         { id: 1, name: 'Oscar', lastName: 'Pillajo', },
        //         { id: 2, name: 'Jhon', lastName: 'Doe', },
        //         { id: 3, name: 'William', lastName: 'Smith', },
        //     ])
        // })

        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        })
    }
}