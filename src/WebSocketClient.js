import { Client } from '@stomp/stompjs';

const WebSocketClient = (() => {
    let client = null;
    let isConnected = false;
    let pendingMessages = [];

    const connect = (onMessageReceived) => {
        client = new Client({
            brokerURL: 'ws://localhost:8080/ws',
            onConnect: () => {
                console.log('Connected to WebSocket');
                isConnected = true;

                // Subscribe to the topic for receiving join responses
                client.subscribe('/user/queue/reply', (message) => {
                    handleReceivedMessage(message, onMessageReceived);
                });

                // Subscribe to the topic for receiving collaborative editing messages
                client.subscribe('/topic/collab', (message) => {
                    handleReceivedMessage(message, onMessageReceived);
                });

                // Send any messages that were queued while waiting for connection
                pendingMessages.forEach((msg) => {
                    client.publish(msg);
                });
                pendingMessages = [];
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                isConnected = false;
            },
            debug: (str) => {
                console.log(str);
            },
        });

        client.activate();
    };

    const handleReceivedMessage = (message, onMessageReceived) => {
        console.log('Raw message received:', message.body);

        if (message && message.body) {
            try {
                // Parse the outer JSON
                const outerMessage = JSON.parse(message.body);

                // Check if the outer message contains a valid body field
                if (outerMessage && outerMessage.body) {
                    // Parse the inner JSON contained in the body field
                    const innerMessage = JSON.parse(outerMessage.body);

                    if (innerMessage && Object.keys(innerMessage).length > 0) {
                        onMessageReceived(innerMessage);
                    } else {
                        console.log('Received empty inner message:', outerMessage.body);
                    }
                } else {
                    console.log('Received outer message without valid body:', message.body);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error, message.body);
            }
        } else {
            console.log('Received empty or malformed message:', message);
        }
    };

    const sendJoinMessage = (sessionId) => {
        const message = {
            destination: '/app/join',
            body: JSON.stringify({ sessionId }),
        };

        if (isConnected) {
            console.log('Sending join message for session:', sessionId);
            client.publish(message);
        } else {
            console.log('WebSocket client is not connected. Queueing join message.');
            pendingMessages.push(message);
        }
    };

    const sendMessage = (message) => {
        const payload = {
            destination: '/app/edit',
            body: JSON.stringify(message),
        };

        if (isConnected) {
            console.log('Sending message:', message);
            client.publish(payload);
        } else {
            console.log('WebSocket client is not connected. Queueing message.');
            pendingMessages.push(payload);
        }
    };

    const disconnect = () => {
        if (client) {
            client.deactivate();
        }
    };

    return {
        connect,
        sendJoinMessage,
        sendMessage,
        disconnect,
    };
})();

export default WebSocketClient;
