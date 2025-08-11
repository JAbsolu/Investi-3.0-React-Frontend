import { Box, Button } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { teal } from "@mui/material/colors";

const white = "#ffffff";

const Pagination = ({ data, children, startingIndex, endingIndex, setNewStartIndex, setNewEndIndex }) => {

    const handleNext = () => {
        setNewStartIndex( prev => prev += 5);
        setNewEndIndex(prev => prev += 5);
    }

    const handleBack = () => {
        if (endingIndex === 0) {
            setNewStartIndex(0);
            setNewEndIndex(5);
        }

        setNewStartIndex( prev => prev -= 5);
        setNewEndIndex(prev => prev -= 5);
    }
    return (
        <>
            <div className="flex justify-between w-full">
                {children}
            </div>
            <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 1, px: 0 }}>
                <Button
                    startIcon={<NavigateBeforeIcon />}
                    onClick={handleBack}
                    disabled={startingIndex < 1 ? true : false}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: teal[400],
                        px: 0,
                    }}
                >
                </Button>
                <Button
                    disabled={endingIndex >= data.length ? true : false}
                    endIcon={<NavigateNextIcon />}
                    onClick={handleNext}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        color: teal[400],
                        px: 0,
                    }}
                >
                </Button>
            </Box>     
        </>
  );
};

export default Pagination;
