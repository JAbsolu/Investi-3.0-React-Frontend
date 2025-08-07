import React, { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, Loader, TrendingUp, Search } from 'lucide-react';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import { 
  Box, Typography, CircularProgress, 
  TextField, IconButton, InputAdornment, Divider, Card, CardContent
} from '@mui/material';
import { teal } from '@mui/material/colors';
import OpenAI from "openai";
import { ref, get, child, set, push } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Stock analysis chat component with modern chat design
const Analysis = ({ result, ticker }) => {
    const [analysisDate, setAnalysisDate] = useState(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [initialAnalysis, setInitialAnalysis] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const contentRef = useRef(null);
    
    // OpenAI client configuration
    const ORG_ID = process.env.REACT_APP_OPENAI_ORG_ID;
    const PROJ_ID = process.env.REACT_APP_OPENAI_PROJECT_ID;
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  
    const client = new OpenAI({
      apiKey: API_KEY,
      organization: ORG_ID,
      project: PROJ_ID,
      dangerouslyAllowBrowser: true
    });

    // Auto-scroll to bottom as messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Monitor auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Save conversation to Firebase
    const saveConversationToFirebase = async (newMessages) => {
        if (!currentUser || !ticker) return;

        try {
            const conversationData = {
                userId: currentUser.uid,
                stock: ticker.toUpperCase(),
                messages: newMessages.filter(msg => msg.role !== 'system'),
                timestamp: Date.now(),
                lastUpdated: Date.now()
            };

            if (conversationId) {
                // Update existing conversation
                await set(ref(database, `conversations/${conversationId}`), conversationData);
            } else {
                // Create new conversation
                const newConversationRef = push(ref(database, 'conversations'));
                await set(newConversationRef, conversationData);
                setConversationId(newConversationRef.key);
            }
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    };

    // Handle sending messages
    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
            timestamp: new Date()
        };

        // Add user message immediately
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputText('');
        setIsLoading(true);

        try {
            // Prepare messages for API
            const apiMessages = updatedMessages.filter(msg => msg.role !== 'system' || msg.content.includes('financial analyst'));

            const stream = await client.chat.completions.create({
                model: "gpt-4o",
                messages: apiMessages,
                stream: true,
                temperature: 0.4,
                max_tokens: 1000,
            });

            // Create assistant message for streaming
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            };

            let finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);

            // Stream the response
            let accumulatedContent = '';
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    accumulatedContent += content;
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = accumulatedContent;
                        }
                        return updated;
                    });
                }
            }

            // Save final conversation to Firebase
            setTimeout(() => {
                setMessages(prev => {
                    saveConversationToFirebase(prev);
                    return prev;
                });
            }, 500);

        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            const errorMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your question. Please try again.',
                timestamp: new Date(),
                isError: true
            };
            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
            saveConversationToFirebase(finalMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Initialize chat with analysis when result changes
    useEffect(() => {
        if (result && ticker) {
            let analysisText = '';
            
            if (typeof result === 'string') {
                analysisText = result;
            } else if (result && result.analysis) {
                analysisText = result.analysis;
            } else if (result) {
                analysisText = [
                    `Decision: ${result.decision || ''}`,
                    `Technical Analysis: ${result.technical_analysis || ''}`,
                    `Fundamental Analysis: ${result.fundamental_analysis || ''}`
                ].join('\n\n');
            }
            
            setInitialAnalysis(analysisText);
            
            // Set initial messages with system prompt and analysis
            const initialMessages = [
                {
                    id: '1',
                    role: 'system',
                    content: `You are a financial analyst assistant analyzing ${ticker}. Use the following context from the previous analysis to maintain consistency and answer follow-up questions thoroughly. Remember key metrics, technical indicators, fundamental data, and your recommendation.`,
                    timestamp: new Date()
                },
                {
                    id: '2',
                    role: 'assistant',
                    content: analysisText,
                    timestamp: new Date()
                }
            ];
            
            setMessages(initialMessages);
            
            // Create new conversation ID for this analysis
            if (currentUser) {
                const newConversationRef = push(ref(database, 'conversations'));
                setConversationId(newConversationRef.key);
            }
        }
    }, [result, ticker, currentUser]);

    // Format message content for display
    const formatMessageContent = (content) => {
        return content
            // Headings
            .replace(/#{3}\s*(.*)/g, `<h3 style="color: ${teal[300]}; font-weight: 600; margin-top: 15px; margin-bottom: 10px; font-size: 18px;">$1</h3>`)
            // Bold
            .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
            // Italics
            .replace(/\*(.*?)\*/g, `<em style="color: #5eead4;">$1</em>`)
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" style="color: ${teal[400]}; text-decoration: none;" target="_blank">$1</a>`)
            // Line breaks
            .replace(/\n/g, '<br>');
    };

    // Add timestamp indicator component
    useEffect(() => {
      if (result && ticker) {
        // Check if there's cached data and get its timestamp
        const checkCacheTimestamp = async () => {
          try {
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, `stockAnalyses/${ticker.toUpperCase()}`));
            
            if (snapshot.exists()) {
              const cachedData = snapshot.val();
              const timestampDate = new Date(cachedData.timestamp);
              
              // Set a timestamp indicator in the UI
              setAnalysisDate(timestampDate);
              
              // Check freshness
              const now = new Date();
              const diffTime = Math.abs(now - timestampDate);
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              setIsFromCache(diffDays < 3);
            }
          } catch (error) {
            console.error("Error getting cache timestamp:", error);
          }
        };
        
        checkCacheTimestamp();
      }
    }, [result, ticker]);

    return (
        <Card 
            sx={{
                width: '100%',
                maxWidth: '900px',
                maxHeight: '600px',
                margin: '0 auto',
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    borderBottom: '1px solid #e2e8f0',
                    px: 2,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${teal[500]}, ${teal[600]})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)'
                        }}
                    >
                        <TrendingUp className="w-5 h-5 text-white" />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: '#1e293b', 
                                fontWeight: 600,
                                fontSize: '18px',
                                lineHeight: 1.2
                            }}
                        >
                            AI Stock Analysis
                        </Typography>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: '#64748b',
                                fontSize: '14px'
                            }}
                        >
                            {ticker ? `Analyzing ${ticker.toUpperCase()}` : 'Ready to analyze'}
                        </Typography>
                    </Box>
                </Box>

                {/* Search/Filter Area */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                        size="small"
                        sx={{ 
                            color: '#64748b',
                            '&:hover': { backgroundColor: '#f1f5f9' }
                        }}
                    >
                        <Search size={18} />
                    </IconButton>
                </Box> */}
            </Box>

            {/* Messages Container */}
            <Box 
                ref={contentRef}
                sx={{ 
                    flex: 1,
                    p:1,
                    overflowY: 'auto',
                    background: '#ffffff',
                    maxHeight: '500px',
                    '&::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f1f5f9'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e1',
                        borderRadius: '3px'
                    }
                }}
            >
                {messages.length === 0 ? (
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '400px',
                            textAlign: 'center'
                        }}
                    >
                        <Box 
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${teal[100]}, ${teal[200]})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 3
                            }}
                        >
                            <Loader className="w-6 h-6 animate-spin" style={{ color: teal[600] }} />
                        </Box>
                        <Typography 
                            variant="h6"
                            sx={{ 
                                color: '#1e293b',
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            Loading Analysis...
                        </Typography>
                        <Typography 
                            variant="body2"
                            sx={{ 
                                color: '#64748b',
                                maxWidth: '300px'
                            }}
                        >
                            Please wait while we prepare your stock analysis and chat interface.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'block' }}>
                        {messages.map((message) => {
                            // Skip system messages
                            if (message.role === 'system') return null;
                            
                            return (
                                <Box
                                    key={message.id}
                                    sx={{
                                        display: 'block',
                                        // flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                                        // gap: 2,
                                        // alignItems: 'flex-start'
                                    }}
                                >
                                    
                                    {/* Message Bubble */}
                                    <Box 
                                        sx={{
                                            maxWidth: '100%',
                                            minWidth: '200px'
                                        }}
                                    >
                                        <Card
                                            sx={{
                                                background: message.role === 'user' 
                                                    ? `linear-gradient(135deg, ${teal[500]}, ${teal[600]})`
                                                    : message.isError 
                                                        ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                                                        : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                                border: message.role === 'user' 
                                                    ? 'none'
                                                    : message.isError 
                                                        ? '1px solid #fecaca'
                                                        : '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                                {message.role === 'user' ? (
                                                    <Typography 
                                                        sx={{ 
                                                            color: 'white',
                                                            fontSize: '15px',
                                                            lineHeight: 1.6,
                                                            whiteSpace: 'pre-wrap'
                                                        }}
                                                    >
                                                        {message.content}
                                                    </Typography>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            fontSize: '15px',
                                                            lineHeight: 1.7,
                                                            color: message.isError ? '#991b1b' : '#1e293b',
                                                            '& h3': { 
                                                                color: teal[600],
                                                                fontWeight: 600,
                                                                fontSize: '18px',
                                                                marginTop: '16px',
                                                                marginBottom: '8px',
                                                                '&:first-of-type': { marginTop: 0 }
                                                            },
                                                            '& p': { 
                                                                marginBottom: '12px',
                                                                '&:last-child': { marginBottom: 0 }
                                                            },
                                                            '& a': { 
                                                                color: teal[600],
                                                                textDecoration: 'none',
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    textDecoration: 'underline'
                                                                }
                                                            },
                                                            '& strong': {
                                                                fontWeight: 600,
                                                                color: '#0f172a'
                                                            },
                                                            '& em': {
                                                                fontStyle: 'italic',
                                                                color: teal[700]
                                                            }
                                                        }}
                                                        dangerouslySetInnerHTML={{ 
                                                            __html: formatMessageContent(message.content)
                                                        }}
                                                    />
                                                )}
                                                
                                                {/* Timestamp */}
                                                <Typography 
                                                    variant="caption"
                                                    sx={{ 
                                                        display: 'block',
                                                        mt: 2,
                                                        color: message.role === 'user' 
                                                            ? 'rgba(255, 255, 255, 0.7)'
                                                            : '#64748b',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Box>
                            );
                        })}
                        
                        {/* Typing Indicator */}
                        {isLoading && (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Box 
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                    }}
                                >
                                    <Bot className="w-4 h-4" style={{ color: teal[600] }} />
                                </Box>
                                
                                <Card
                                    sx={{
                                        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Loader className="w-4 h-4 animate-spin" style={{ color: teal[600] }} />
                                            <Typography 
                                                sx={{ 
                                                    color: '#64748b',
                                                    fontSize: '14px',
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                AI is analyzing...
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        )}
                        
                        {/* Analysis Metadata */}
                        {initialAnalysis && (
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography 
                                        variant="caption"
                                        sx={{ 
                                            color: '#64748b',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        {isFromCache && <FaCloudDownloadAlt size={12} color={teal[500]} />}
                                        {isFromCache ? 'Cached analysis' : 'Fresh analysis'}
                                    </Typography>
                                    
                                    <Typography 
                                        variant="caption"
                                        sx={{ 
                                            color: '#64748b',
                                            fontSize: '12px',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        {analysisDate ? analysisDate.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : new Date().toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                                
                                <Typography 
                                    variant="caption"
                                    sx={{ 
                                        color: '#64748b',
                                        fontSize: '11px',
                                        fontStyle: 'italic',
                                        display: 'block',
                                        background: '#f8fafc',
                                        p: 2,
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    Disclaimer: Past performance does not guarantee future results. Investment decisions are your responsibility.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
                
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box 
                sx={{
                    px: 4,
                    py: 3,
                    borderTop: '1px solid #e2e8f0',
                    background: '#f8fafc'
                }}
            >
                <Box 
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Ask a follow-up question about the analysis..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        variant="outlined"
                        sx={{
                            '& .MuiInputBase-root': {
                                background: '#ffffff',
                                borderRadius: '12px',
                                fontSize: '15px',
                                '& fieldset': {
                                    borderColor: '#e2e8f0'
                                },
                                '&:hover fieldset': {
                                    borderColor: teal[300]
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: teal[500],
                                    borderWidth: '2px'
                                }
                            },
                            '& .MuiInputBase-input': {
                                color: '#1e293b'
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: '#94a3b8',
                                opacity: 1
                            }
                        }}
                    />
                    
                    <IconButton
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        sx={{
                            width: 48,
                            height: 48,
                            background: `linear-gradient(135deg, ${teal[500]}, ${teal[600]})`,
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${teal[600]}, ${teal[700]})`,
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)'
                            },
                            '&:disabled': {
                                background: '#e2e8f0',
                                color: '#94a3b8',
                                boxShadow: 'none',
                                transform: 'none'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </IconButton>
                </Box>
                
                {/* Input Footer */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '12px' }}>
                        Press Enter to send, Shift+Enter for new line
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '12px' }}>
                        {inputText.length}/2000
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default Analysis;
