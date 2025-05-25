import { Box, Typography, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

function PageHeader({ title, onAdd, addButtonText = "Add New" }) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
            }}
        >
            <Typography variant="h4" component="h1">
                {title}
            </Typography>
            {onAdd && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAdd}
                >
                    {addButtonText}
                </Button>
            )}
        </Box>
    );
}

export default PageHeader;
