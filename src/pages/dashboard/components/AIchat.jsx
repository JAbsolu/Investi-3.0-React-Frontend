import { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Avatar, IconButton,
  useMediaQuery, useTheme, Divider, CircularProgress, InputAdornment
} from '@mui/material';
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from 'react-icons/fa';
import { green, teal, grey } from '@mui/material/colors';

// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const AiChat = ({ isOpen, onClose, stockSymbol, fullPage = false }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiReponse, setAiResponse] = useState(""); // Streaming response
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiReponse]);

  // Initial message from AI when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          id: 1, 
          text: `Hello! I'm your AI assistant. How can I help you with ${stockSymbol || 'your investments'} today?`, 
          sender: 'ai'
        }
      ]);
    }
  }, [isOpen, stockSymbol]);

  const sendQue = async (prompt) => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setAiResponse("");
    
    // Add user message to UI
    const userMessage = { id: Date.now(), text: prompt, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Call your backend API instead of OpenAI directly
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          stockSymbol: stockSymbol,
          conversationHistory: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to messages
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.response || data.message || 'No response received', 
        sender: 'ai' 
      }]);
      
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: 'Sorry, I encountered an error processing your request. Please try again.', 
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
      setAiResponse("");
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendQue(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={fullPage ? 0 : 5}
      sx={{
        position: fullPage ? 'relative' : isMobile ? 'fixed' : 'absolute',
        bottom: fullPage ? 'auto' : isMobile ? 0 : 20,
        right: fullPage ? 'auto' : isMobile ? 0 : 20,
        width: fullPage ? '100%' : isMobile ? '100%' : 350,
        height: fullPage ? '100%' : isMobile ? '90vh' : 500,
        background: 'rgba(20, 30, 20, 0.5)',
        borderRadius: fullPage ? '12px' : isMobile ? '12px 12px 0 0' : '12px',
        border: `1px solid ${green[900]}`,
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: fullPage ? 1 : 1300,
        boxShadow: fullPage ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.3)',
        transform: !fullPage && isOpen ? 'translateY(0)' : !fullPage ? 'translateY(100%)' : 'none',
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {/* Chat Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${green[900]}`,
          background: 'rgba(0, 30, 0, 0.3)',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <FaRobot style={{ color: teal[400], fontSize: 20 }} />
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: white,
              fontWeight: 'bold',
              fontSize: { xs: '0.95rem', sm: '1rem' },  
            }}
          >
            Investi
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: white }}>
          <FaTimes />
        </IconButton>
      </Box>

      {/* Messages Display */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((msg, i) => (
          <Box key={i} display="flex" alignItems="flex-start" mb={2}>
            <Avatar sx={{ bgcolor: msg.sender === 'user' ? green[500] : teal[500], mr: 2 }}>
              {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
            </Avatar>
            <Paper sx={{ p: 1.5, backgroundColor: msg.sender === 'user' ? green[900] : teal[900], color: white }}>
              <Typography variant="body2">{msg.text}</Typography>
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box display="flex" alignItems="center" mb={2}>
            <CircularProgress size={20} sx={{ color: white, mr: 2 }} />
            <Typography variant="body2" color={white}>
              {aiReponse}
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: `1px solid ${green[900]}` }}>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Ask AI about stock trends..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            style: {
              color: white,
              backgroundColor: darkBg,
              borderRadius: 8,
            }
          }}
          InputLabelProps={{
            style: {
              color: grey[500]
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isLoading}
          sx={{
            bgcolor: green[500],
            color: "black",
            px: 3,
            py: 2.5,
            borderRadius: 1,
            mt: 1,
            "&:hover": { bgcolor: green[700] }
          }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: white }} /> : <FaPaperPlane />}
        </Button>
      </Box>
    </Paper>
  );
};

export default AiChat;



