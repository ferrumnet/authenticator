// src/components/HeaderFullWidth.tsx
import React from 'react';
import { AppBar, Box, Link, Toolbar } from '@mui/material';

const HeaderFullWidth = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Box component="img" src="/logo.png" alt="Logo" sx={{ maxHeight: '2rem' }} />
                <Box sx={{ flexGrow: 1 }} />
                <Link href="https://gateway.ferrumnetwork.io/" color="inherit">
                    Gateway
                </Link>
                <Link href="https://discord.gg/TfrWeN8Vtq" color="inherit" sx={{ ml: 2 }}>
                    Discord Support
                </Link>
            </Toolbar>
        </AppBar>
    )
}

export default HeaderFullWidth;
