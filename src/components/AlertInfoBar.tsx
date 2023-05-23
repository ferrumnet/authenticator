// src/components/AlertInfoBar.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';

const REACT_APP_DISCORD_REDIRECT_URL = process.env.REACT_APP_DISCORD_REDIRECT_URL;

function AlertInfoBar() {
    return (
        <Box sx={{ width: '100%', bgcolor: 'primary.main', p: 2 }}>
            <Typography variant="h6" align="center" color="primary.contrastText" fontSize={15}>
                IMPORTANT: Make sure the URL in the window matches "{REACT_APP_DISCORD_REDIRECT_URL}". Never share your seed phrase or private key with anyone.
            </Typography>
        </Box>
    );
}

export default AlertInfoBar;
