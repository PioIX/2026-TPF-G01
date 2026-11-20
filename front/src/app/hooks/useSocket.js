
import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { API_URL } from '@/app/config';

const useSocket = (options = { withCredentials: true }, serverUrl = API_URL) => {

    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {

        const socketIo = io(serverUrl, options);

        socketIo.on('connect', () => {
            setIsConnected(true);
            console.log('WebSocket conectado.');
        });

        socketIo.on('disconnect', () => {
            setIsConnected(false);
            console.log('WebSocket desconectado');
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };

    }, [serverUrl, JSON.stringify(options)]);

    return { socket, isConnected };
};

export default useSocket;