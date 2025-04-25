import {Box, Button, Typography} from "@mui/material";

function HomePage() {
    return (
        <>
            <Box sx={{width: '100%'}}>
                <Typography variant="h1" gutterBottom>
                    Kawsay
                </Typography>
                <Typography variant="h2" gutterBottom>
                    timetable management
                </Typography>
                <Button variant={"contained"} href={"/creation"}>
                    New timetable
                </Button>
            </Box>
        </>
    )
}

export default HomePage
