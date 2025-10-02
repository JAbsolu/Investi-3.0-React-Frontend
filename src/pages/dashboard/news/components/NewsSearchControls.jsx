// NewsSearchControls.jsx - Make it more compact
import { Box, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { grey, teal } from '@mui/material/colors';

const NewsSearchControls = ({ 
    searchQuery, 
    setSearchQuery, 
    onSearch, 
    onClear, 
    loading, 
    searchActive,
    resultsCount 
}) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
                size="small"
                placeholder="Search by ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                sx={{
                    width: { xs: '100%', sm: 320 },
                    '& .MuiOutlinedInput-root': {
                        color: 'white',
                        backgroundColor: grey[900],
                        height: 36,
                        fontSize: '0.875rem',
                        '& fieldset': {
                            border: `1px solid ${grey[800]}`,
                        },
                        '&:hover fieldset': {
                            borderColor: grey[700],
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: teal[600],
                            borderWidth: 1,
                        },
                    },
                    '& .MuiInputBase-input': {
                        padding: '8px 12px',
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {loading ? (
                                <CircularProgress size={16} sx={{ color: teal[400] }} />
                            ) : (
                                <FaSearch size={14} color={grey[500]} />
                            )}
                        </InputAdornment>
                    ),
                    endAdornment: searchActive && (
                        <InputAdornment position="end">
                            <IconButton
                                size="small"
                                onClick={onClear}
                                sx={{ 
                                    color: grey[400],
                                    padding: 0.5,
                                    '&:hover': { 
                                        color: teal[400],
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                <FaTimes size={12} />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default NewsSearchControls;