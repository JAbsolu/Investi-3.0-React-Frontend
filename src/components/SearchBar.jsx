import { Box, InputAdornment, TextField } from "@mui/material"
import { green, grey, teal } from "@mui/material/colors";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ handleSearchOnEnter, ticker, setTicker, placeholder }) => {

    return (
        <Box
            component="form"
            sx={{ display: "flex", 
                    alignItems: "center", 
                    gap: 0.5, 
                    mb: 2, 
                    mt: 0,
                    borderRadius: '10px',
                    border: `1px solid ${teal[500]}`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    width: '100%',
                    alignSelf: 'flex-start',
                    minHeight: '2.5em',
                    maxHeight: '2.8em',
                    zIndex: 10, 
                }}
            noValidate
            autoComplete="off"
            >
            <TextField fullWidth
                placeholder={placeholder}
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={(e) => handleSearchOnEnter(e)}
                sx={{
                    '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '& fieldset': { border: 'none' }
                    },
                    '& .MuiInputBase-input': {
                        color: "#ffffff",
                        fontSize: '10pt',
                        padding: '4px 8px',
                        '&::placeholder': {
                            color: grey[200],
                            opacity: 1
                        }
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '10pt', // Adjust the font size as needed
                    },
                    height: '2em',
                    backgroundColor: 'transparent',
                    fontSize: "10pt",
                }}
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <FaSearch style={{ 
                            color: teal[300], 
                            fontSize: '16px' 
                        }} />
                    </InputAdornment>
                    ),
                }}
            />
        </Box>
    )
}   

export default SearchBar;