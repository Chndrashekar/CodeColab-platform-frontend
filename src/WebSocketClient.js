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
    
        if (!message || !message.body) {
            console.log('Received empty or malformed message:', message);
            return;
        }
    
        try {
            // Parse the outer JSON
            const outerMessage = JSON.parse(message.body);
    
            // Ensure the outer message contains valid data
            if (!outerMessage) {
                console.log('Received outer message without valid data:', message.body);
                return;
            }
    
            // Extract language, description, and content if they exist
            const language = outerMessage.body?.language || null;
            const description = outerMessage.body?.description || null;
            const content = outerMessage.body?.content || null;
    
            let parsedLanguage = null;
            let parsedDescription = null;
            let parsedContent = null;
    
            // Parse language if present
            if (language) {
                try {
                    parsedLanguage = JSON.parse(language).language;
                } catch (error) {
                    console.error('Error parsing language:', error);
                }
            }
    
            // Parse description if present
            if (description) {
                try {
                    parsedDescription = JSON.parse(description).description;
                } catch (error) {
                    console.error('Error parsing description:', error);
                }
            }
    
            // Parse content if present
            if (content) {
                try {
                    parsedContent = JSON.parse(content).content;
                } catch (error) {
                    console.error('Error parsing content:', error);
                }
            }
    
            // Call onMessageReceived if any of the values are present
            if (parsedLanguage || parsedDescription || parsedContent) {
                onMessageReceived({
                    language: parsedLanguage,
                    description: parsedDescription,
                    content: parsedContent
                });
            }
    
        } catch (error) {
            console.error('Error parsing JSON:', error, message.body);
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

    const sendLanguageMessage = (language) => {
        if (isConnected) {
            client.publish({
                destination: '/app/setLanguage',  // Ensure this matches the backend's @MessageMapping("/setLanguage")
                body: JSON.stringify({ language }),
            });
        } else {
            console.log('WebSocket client is not connected.');
        }
    };
    const sendDescriptionMessage = (description) => {
        if (client && client.connected) {
            client.publish({
                destination: '/app/setDescription',
                body: JSON.stringify(description),
            });
        } else {
            console.log('WebSocket client is not connected.');
        }
    };

    const disconnect = () => {
        if (client) {
            client.deactivate();
        }
    };

    return {
        connect,
        sendLanguageMessage,
        sendDescriptionMessage,
        sendJoinMessage,
        sendMessage,
        disconnect,
    };
})();

export default WebSocketClient;
