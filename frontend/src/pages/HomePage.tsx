import {Box, Button, Typography} from "@mui/material";

function HomePage() {
    return (
        <>
            <Box sx={{width: '100%', maxWidth: 500}}>
                <Typography variant="h2" gutterBottom>
                    Kawsay timetable management
                </Typography>
                <Button variant={"contained"} href={"/creation"}>
                    New timetable
                </Button>
            </Box>
        </>
    )
}

export default HomePage
