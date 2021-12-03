import io, { Socket } from 'socket.io-client';

export default class Networking {
    
    socket!: Socket;

    Connect() {
        const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
        this.socket = io(`${socketProtocol}://localhost:3000`, { reconnection: false });
        //const connectedPromise = new Promise<void>(resolve => {
        this.socket.on('connect', () => {
            console.log('Connected to server!');
            //resolve();
        });
        //});
    }

    Play(username : string){
        this.socket.emit('join_game', username);
    }
  }