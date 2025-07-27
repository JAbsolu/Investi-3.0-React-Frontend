import { Box, Button, Link, Paper, Typography } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { grey, teal } from "@mui/material/colors";

const white = "#ffffff";

const SearchPagination = ({ searchResults, startingIndex, endingIndex, handleBack, handleNext }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                <Button
                    startIcon={<NavigateBeforeIcon />}
                    onClick={handleBack}
                    disabled={startingIndex < 1 ? true : false}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: teal[400],
                    }}
                >
                </Button>
                <Typography sx={{ color: teal[400], mt: 0.5, fontSize: "10pt"}}>
                    {startingIndex + 1} - {endingIndex}
                </Typography>
                <Button
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: teal[400]
                    }}
                >
                </Button>
            </Box>     
            <Box sx={{ maxWidth: "100%", mx: "auto" }}>
                {searchResults.slice(startingIndex, endingIndex).map((news, index) => (
                    <Paper 
                        key={news.id || index}
                        elevation={0}
                        sx={{
                            backgroundColor: 'transparent',
                            borderBottom: `1px solid ${grey[900]}`,
                            borderRadius: 0,
                            transition: 'all 0.2s ease',
                            width: "100%", // Full fixed width
                            maxWidth: "100%", // Ensure it doesn't overflow container
                            marginBottom: 0,
                            '&:hover': {
                                backgroundColor: '#0cac990d',
                                '& .news-title': {
                                    color: teal[300],
                                }
                            }
                        }}
                    >
                        <Link 
                            href={news?.url} 
                            target="_blank" 
                            underline="none" 
                            color={white}
                            sx={{ 
                                display: 'block',
                                width: "100%"
                            }}
                        >
                            <Box 
                                py={2} 
                                // px={{ xs: 2, sm: 3 }}
                                sx={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    "&:hover": {
                                        px: 1,
                                        transition: "all 0.4s ease-in-out",
                                    }
                                }}
                            >
                                <Box display="flex" justifyContent="space-between" mb={1} flexWrap="wrap">
                                    <Typography 
                                        fontSize={{ xs: '0.75rem', sm: '0.85rem' }} 
                                        sx={{ 
                                            color: teal[400],
                                            fontWeight: 500,
                                            mb: 0.5
                                        }}
                                    >
                                        {news?.source ? (news.source.charAt(0).toUpperCase() + news.source.slice(1)) : 'News Source'}
                                    </Typography>
                                    
                                    {news?.publishedDate && (
                                        <Typography 
                                            fontSize={{ xs: '0.7rem', sm: '0.75rem' }} 
                                            color={grey[500]}
                                        >
                                            {formatDate(news.publishedDate)}
                                        </Typography>
                                    )}
                                </Box>
                                
                                <Typography 
                                    className="news-title"
                                    fontWeight="bold" 
                                    color={white}
                                    mb={1}
                                    sx={{ 
                                        fontSize: { xs: '0.95rem', sm: '1.1rem' },
                                        transition: 'color 0.2s ease'
                                    }}
                                >
                                    {news?.title}
                                </Typography>
                                
                                <Typography 
                                    fontSize={{ xs: '0.8rem', sm: '0.9rem' }} 
                                    color={grey[400]}
                                    sx={{
                                        lineHeight: 1.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {news?.description}
                                </Typography>
                            </Box>
                        </Link>
                    </Paper>
                ))}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 2,
                }}
            >
                <Button
                    startIcon={<NavigateBeforeIcon />}
                    onClick={handleBack}
                    disabled={startingIndex < 1 ? true : false}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: teal[400],
                    }}
                >
                    Back
                </Button>
            <Typography sx={{ color: teal[400], mt: 0.5, fontSize:"10pt" }}>
                    {startingIndex + 1} - {endingIndex}
            </Typography>
                <Button
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                        textTransform: "none",
                        fontWeight: "normal",
                        color: teal[400]
                    }}
                >
                    Next
                </Button>
            </Box>
        </>
  );
};

export default SearchPagination;
