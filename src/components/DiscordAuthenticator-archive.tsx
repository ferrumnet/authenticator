// src/components/DiscordAuthenticator.tsx
import React from 'react';
import Web3 from 'web3';
import { AppBar, Box, Button, Container, Link, Paper, Toolbar, Typography } from '@mui/material';
import HeaderFullWidth from './HeaderFullWidth';


const REACT_APP_DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REACT_APP_DISCORD_REDIRECT_URL = process.env.REACT_APP_DISCORD_REDIRECT_URL as string;

export const DiscordAuthenticator: React.FC = () => {

    const handleLogin = () => {
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REACT_APP_DISCORD_REDIRECT_URL)}&response_type=code&scope=identify%20email%20guilds.join`;
    };

    return (
        <Box>
            <HeaderFullWidth />
            <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Paper sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }} elevation={3}>
                    <Typography component="h1" variant="h5">
                        Verify your Discord Account
                    </Typography>
                    <Typography component="p">
                        Explanation for the user why they are being asked to login.
                    </Typography>
                    <Box
                        sx={{ width: '100%', mt: 1 }}
                    >
                        <Button
                            onClick={handleLogin}
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Login with Discord
                            </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default DiscordAuthenticator;
