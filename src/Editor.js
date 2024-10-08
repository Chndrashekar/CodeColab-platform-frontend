import React, { useState, useEffect } from 'react';
import WebSocketClient from './WebSocketClient';
import { useParams } from 'react-router-dom';
import AceEditor from 'react-ace';

// Import themes and modes for Ace Editor
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';

import './Editor.css';  // Import custom styles

const Editor = () => {
    const { sessionId } = useParams();  // Extract the session ID from the URL
    const [content, setContent] = useState('');  // State to hold the content of the editor
    const [language, setLanguage] = useState('javascript');  // State to hold the selected language
    const [fontSize, setFontSize] = useState(16);  // State to hold the font size of the editor
    const [description, setDescription] = useState('');  // Start with an empty string

    useEffect(() => {
        // Connect to the WebSocket server and handle incoming messages
        WebSocketClient.connect((message) => {
            if (message.content !== undefined) {
                console.log('Received content:', message.content);
                setContent(message.content);  // Update the editor content with the received message
            }
            if (message.language !== undefined) {
                console.log('Received language:', message.language);
                setLanguage(message.language);  // Set the editor language
            }
            if (message.description !== undefined) {
                console.log('Received description:', message.description);
                setDescription(message.description);  // Set the editor description
            }
        });

        // Send the join message for the session
        WebSocketClient.sendJoinMessage(sessionId);

        return () => {
            WebSocketClient.disconnect();  // Clean up the WebSocket connection when the component is unmounted
        };
    }, [sessionId]);

    const handleEditorChange = (value) => {
        setContent(value);  // Update the editor content locally
        WebSocketClient.sendMessage({ content: value });  // Send the new content to the server
    };

    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setLanguage(newLanguage);  // Update the selected language
    
        // Send the new language to the server
        WebSocketClient.sendLanguageMessage(newLanguage);
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setDescription(newDescription);

        // Send the new description to the server
        WebSocketClient.sendDescriptionMessage({description: newDescription});
    };

    const handleFontSizeChange = (event) => {
        setFontSize(parseInt(event.target.value, 10));  // Update the selected font size
    };

    return (
        <div className="container">
            <div className="info-panel">
                <h2>Problem Statement</h2>
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    rows="5"
                    placeholder="Start writing your problem statement here..."
                    style={{ width: '100%', marginBottom: '10px' }}
                />
            </div>
            <div className="editor-container">
                <div className="editor-header">
                    <label htmlFor="language-select">Language: </label>
                    <select id="language-select" value={language} onChange={handleLanguageChange}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        {/* Add more languages as needed */}
                    </select>
                    <label htmlFor="font-size-select" style={{ marginLeft: '20px' }}>Font Size: </label>
                    <select id="font-size-select" value={fontSize} onChange={handleFontSizeChange}>
                        <option value="12">12px</option>
                        <option value="14">14px</option>
                        <option value="16">16px</option>
                        <option value="18">18px</option>
                        <option value="20">20px</option>
                        <option value="24">24px</option>
                    </select>
                </div>
                <AceEditor
                    mode={language}  // Use the selected language for syntax highlighting
                    theme="monokai"
                    value={content}
                    onChange={handleEditorChange}
                    name="ace-editor"
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                        showPrintMargin: false,  // Disable the vertical line
                    }}
                    width="100%"
                    height="100vh"
                    fontSize={fontSize}  // Set the font size of the editor
                />
            </div>

        </div>
    );
};

export default Editor;
