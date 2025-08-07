import React, { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, Loader, TrendingUp } from 'lucide-react';
import { teal } from '@mui/material/colors';
import OpenAI from "openai";
import { ref, get, child, set, push } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Stock analysis chat component with modern chat design
const AnalysisChat = ({ ticker }) => {
    const [analysisDate, setAnalysisDate] = useState(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [initialAnalysis, setInitialAnalysis] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isWaitingForAnalysis, setIsWaitingForAnalysis] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const API_URL = process.env.REACT_APP_API_URL || "https://www.investii.site";

      //----------------- perform analysis with global cache ----------------
    const saveAnalysisToCache = async (ticker, analysisData) => {
        try {
            const cacheData = {
                analysis: analysisData,
                timestamp: Date.now()
            };
            await set(ref(database, `stockAnalyses/${ticker}`), cacheData);
        } catch (error) {
            console.error("Error saving analysis to cache:", error);
        }
    };

    const getAiAnalysis = async (ticker) => {
      if (!ticker) return;
      
      setIsWaitingForAnalysis(true);
      setMessages([]); // Clear any previous messages
      
      try {
        // Standardize ticker to uppercase for consistent keys
        const standardizedTicker = ticker.toUpperCase();
        
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `stockAnalyses/${standardizedTicker}`));
        
        if (snapshot.exists()) {
          const cachedAnalysis = snapshot.val();
          const analysisDate = new Date(cachedAnalysis.timestamp);
          const now = new Date();
          
          // Calculate difference in days
          const diffTime = Math.abs(now - analysisDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // If analysis is less than 3 days old, use it
          if (diffDays < 3) {            
            // Set the cached analysis data to state
            setAnalysisResult(cachedAnalysis.analysis);
            setAnalysisDate(analysisDate);
            setIsFromCache(true);
            setIsWaitingForAnalysis(false);
            return;
          }
        }
        
        // If we got here, we need a fresh analysis
        const openAiURL = `${API_URL}/analysis?ticker=${standardizedTicker}`;
        
        const response = await fetch(openAiURL);
        const result = await response.json();
        
        if (!response.ok) {
          console.log(response.status, result.message);
          setIsWaitingForAnalysis(false);
          return;
        }
        
        // Get analysis data from API response
        const analysisData = result.data;
        setAnalysisResult(analysisData);
        setAnalysisDate(new Date());
        setIsFromCache(false);
        setIsWaitingForAnalysis(false);
        
        // Save new analysis to Firebase
        await saveAnalysisToCache(standardizedTicker, analysisData);
        
        console.log(`Fresh analysis for ${standardizedTicker} completed and cached.`);
      } catch (error) {
        console.log("Error in AI Analysis:", error.message || "");
        setIsWaitingForAnalysis(false);
      }
    };
    
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

    // Track when we're waiting for analysis
    useEffect(() => {
        if (ticker && !analysisResult) {
            setIsWaitingForAnalysis(true);
            setMessages([]); // Clear any previous messages
        } else if (analysisResult) {
            setIsWaitingForAnalysis(false);
        }
    }, [ticker, analysisResult]);

    // Trigger analysis when ticker changes
    useEffect(() => {
        if (ticker) {
            getAiAnalysis(ticker);
        }
    }, [ticker]);

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

    // Initialize chat with analysis when analysisResult changes - now supports streaming
    useEffect(() => {
        if (analysisResult && ticker) {
            // Set initial messages with system prompt first
            const systemMessage = {
                id: '1',
                role: 'system',
                content: `You are a financial analyst assistant analyzing ${ticker}. Use the following context from the previous analysis to maintain consistency and answer follow-up questions thoroughly. Remember key metrics, technical indicators, fundamental data, and your recommendation.`,
                timestamp: new Date()
            };

            // Create streaming assistant message
            const assistantMessage = {
                id: '2',
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                isStreaming: true
            };

            const initialMessages = [systemMessage, assistantMessage];
            setMessages(initialMessages);

            // Start streaming the result
            let analysisText = '';
            if (typeof analysisResult === 'string') {
                analysisText = analysisResult;
            } else if (analysisResult && analysisResult.analysis) {
                analysisText = analysisResult.analysis;
            } else if (analysisResult) {
                analysisText = [
                    `Decision: ${analysisResult.decision || ''}`,
                    `Technical Analysis: ${analysisResult.technical_analysis || ''}`,
                    `Fundamental Analysis: ${analysisResult.fundamental_analysis || ''}`
                ].join('\n\n');
            }

            // Simulate streaming by adding characters progressively
            let currentIndex = 0;
            const streamInterval = setInterval(() => {
                if (currentIndex < analysisText.length) {
                    const chunk = analysisText.slice(0, currentIndex + 3); // Add 3 characters at a time
                    currentIndex += 3;

                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = chunk;
                            lastMessage.isStreaming = currentIndex < analysisText.length;
                        }
                        return updated;
                    });
                } else {
                    // Streaming complete
                    clearInterval(streamInterval);
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastMessage = updated[updated.length - 1];
                        if (lastMessage && lastMessage.role === 'assistant') {
                            lastMessage.content = analysisText;
                            lastMessage.isStreaming = false;
                        }
                        return updated;
                    });
                    setInitialAnalysis(analysisText);
                }
            }, 50); // Stream at 50ms intervals for smooth effect

            // Create new conversation ID for this analysis
            if (currentUser) {
                const newConversationRef = push(ref(database, 'conversations'));
                setConversationId(newConversationRef.key);
            }

            // Cleanup interval on unmount or when effect reruns
            return () => clearInterval(streamInterval);
        }
    }, [analysisResult, ticker, currentUser]);

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
      if (analysisResult && ticker) {
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
    }, [analysisResult, ticker]);

    return (
        <div className="flex flex-col w-full mb-6 min-h-[600px] max-w-4xl mx-auto overflow-hidden rounded-xl shadow-2xl" 
            style={{ background: 'rgba(10, 20, 15, 0.9)', border: `1px solid ${teal[200]}40`, backdropFilter: 'blur(10px)'}}
        >
            {/* Header */}
            <div className="px-6 py-4 border-b shadow-sm"
                style={{ background: `linear-gradient(135deg, ${teal[400]}20, transparent)`, borderBottomColor: `${teal[200]}40`}}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: teal[600] }}>
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-white">
                            AI ticker Analysis {ticker ? `- ${ticker.toUpperCase()}` : ''}
                        </h1>
                        <p className="text-sm" style={{ color: teal[300] }}>
                            {isWaitingForAnalysis ? 'Analyzing market data...' : 'Online and ready to help'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
                 style={{ 
                     background: 'rgba(5, 10, 7, 0.8)',
                     maxHeight: '500px'
                 }}>
                
                {isWaitingForAnalysis ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative">
                            <Loader className="w-16 h-16 animate-spin mb-4" style={{ color: teal[400] }} />
                            <div className="absolute inset-0 w-16 h-16 border-2 border-dashed rounded-full animate-ping" 
                                 style={{ borderColor: teal[300], animationDuration: '2s' }}></div>
                        </div>
                        <p className="text-xl font-bold mb-2" style={{ color: teal[300] }}>
                            Analyzing {ticker?.toUpperCase()}...
                        </p>
                        <p className="text-sm text-center max-w-md" style={{ color: teal[200] }}>
                            Our AI is processing market data, technical indicators, and fundamental analysis. This may take a few moments.
                        </p>
                        <div className="mt-4 flex items-center space-x-2" style={{ color: teal[400] }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teal[400] }}></div>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teal[400], animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teal[400], animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader className="w-15 h-15 animate-spin mb-4" style={{ color: teal[400] }} />
                        <p className="text-lg font-bold" style={{ color: teal[300] }}>
                            Loading analysis...
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => {
                            // Skip system messages
                            if (message.role === 'system') return null;
                            
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-xs lg:max-w-md ${
                                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                    } items-end space-x-2`}>
                                        
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            message.role === 'user' ? 'ml-2' : 'mr-2'
                                        }`} style={{
                                            backgroundColor: message.role === 'user' ? teal[600] : 'rgba(100, 100, 100, 0.3)'
                                        }}>
                                            {message.role === 'user' ? 
                                                <User className="w-4 h-4 text-white" /> : 
                                                <Bot className="w-4 h-4 text-gray-200" />
                                            }
                                        </div>
                                        
                                        {/* Message Bubble */}
                                        <div className={`px-4 py-2 rounded-lg ${
                                            message.role === 'user' 
                                                ? 'text-white' 
                                                : message.isError 
                                                    ? 'border border-red-200'
                                                    : 'text-gray-100 border'
                                        }`} style={{
                                            backgroundColor: message.role === 'user' 
                                                ? teal[600] 
                                                : message.isError 
                                                    ? 'rgba(254, 202, 202, 0.1)'
                                                    : 'rgba(20, 30, 20, 0.6)',
                                            borderColor: message.role === 'user' 
                                                ? 'transparent'
                                                : message.isError 
                                                    ? '#fecaca'
                                                    : `${teal[800]}40`
                                        }}>
                                            {message.role === 'user' ? (
                                                <p className="text-sm whitespace-pre-wrap text-white">
                                                    {message.content}
                                                </p>
                                            ) : (
                                                <div
                                                    className="text-sm whitespace-pre-wrap"
                                                    style={{
                                                        fontSize: '15px',
                                                        lineHeight: 1.7,
                                                        letterSpacing: 0.3,
                                                    }}
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: formatMessageContent(message.content)
                                                    }}
                                                />
                                            )}
                                            
                                            {/* Show streaming indicator */}
                                            {message.isStreaming && (
                                                <div className="flex items-center mt-2">
                                                    <Loader className="w-3 h-3 animate-spin mr-2" style={{ color: teal[400] }} />
                                                    <span className="text-xs" style={{ color: teal[300] }}>
                                                        Streaming...
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <p className={`text-xs mt-1 ${
                                                message.role === 'user' 
                                                    ? 'opacity-70' 
                                                    : 'text-gray-400'
                                            }`}>
                                                {formatTime(message.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Typing Indicator */}
                        {isLoading && !messages.some(msg => msg.isStreaming) && (
                            <div className="flex justify-start">
                                <div className="flex items-end space-x-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                                         style={{ backgroundColor: 'rgba(100, 100, 100, 0.3)' }}>
                                        <Bot className="w-4 h-4 text-gray-200" />
                                    </div>
                                    <div className="px-4 py-2 rounded-lg border"
                                         style={{ 
                                             backgroundColor: 'rgba(20, 30, 20, 0.6)',
                                             borderColor: `${teal[800]}40`
                                         }}>
                                        <div className="flex items-center space-x-1">
                                            <Loader className="w-4 h-4 animate-spin" style={{ color: teal[400] }} />
                                            <span className="text-sm" style={{ color: '#5eead4' }}>
                                                AI is typing...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Analysis metadata */}
                        {initialAnalysis && !messages.some(msg => msg.isStreaming) && (
                            <div className="mt-6 pt-4 border-t" style={{ borderColor: `${teal[800]}40` }}>
                                <div className="flex justify-between items-center mb-2 opacity-80">
                                    <span className="text-xs flex items-center gap-1" style={{ color: '#5eead4' }}>
                                        {isFromCache && <TrendingUp size={12} color={teal[400]} />}
                                        {isFromCache ? 'Globally cached analysis' : 'Fresh analysis'}
                                    </span>
                                    
                                    <span className="text-xs italic" style={{ color: '#0f766e' }}>
                                        Analysis as of: {analysisDate ? analysisDate.toLocaleDateString('en-US', {
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
                                    </span>
                                </div>
                                
                                <div className="text-xs italic p-3 rounded border"
                                     style={{
                                         color: '#0f766e',
                                         backgroundColor: 'rgba(0,30,0,0.2)',
                                         borderColor: `${teal[800]}40`
                                     }}>
                                    Disclaimer: The past performance of a security, an industry, a sector, a market, a financial product, a trading strategy or the individual trade does not guarantee any future results or returns. As an investor, you yourself bear the full responsibility for your individual investment decisions.
                                </div>
                            </div>
                        )}
                    </>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t"
                 style={{
                     backgroundColor: `${teal[900]}10`,
                     borderTopColor: `${teal[800]}40`
                 }}>
                <div className="flex items-end space-x-4">
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isWaitingForAnalysis ? "Waiting for analysis to complete..." : "Type your message here..."}
                            className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-all duration-200"
                            rows="1"
                            style={{ 
                                minHeight: '44px', 
                                maxHeight: '120px',
                                backgroundColor: 'rgba(5, 10, 7, 0.8)',
                                borderColor: `${teal[800]}40`,
                                color: 'white',
                                backdropFilter: 'blur(4px)'
                            }}
                            disabled={isLoading || isWaitingForAnalysis}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isLoading || isWaitingForAnalysis}
                        className="p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        style={{
                            backgroundColor: teal[600],
                            color: 'white',
                            focusRingColor: teal[500]
                        }}
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                
                {/* Character count or other info */}
                <div className="flex justify-between items-center mt-2 text-xs" style={{ color: '#0f766e' }}>
                    <span>
                        {isWaitingForAnalysis 
                            ? "Analysis in progress - chat will be available once complete" 
                            : "Press Enter to send, Shift+Enter for new line"
                        }
                    </span>
                    <span>{inputText.length}/2000</span>
                </div>
            </div>
        </div>
    );
};

export default AnalysisChat;


