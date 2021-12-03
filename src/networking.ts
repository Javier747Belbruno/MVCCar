import io from 'socket.io-client';

export default class Networking {
    
    Connect() {
        const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
        const socket = io(`${socketProtocol}://localhost:3000`, { reconnection: false });
        //const connectedPromise = new Promise<void>(resolve => {
        socket.on('connect', () => {
            console.log('Connected to server!');
            //resolve();
        });
        //});
    }
  }