// src/components/DiscordAuthenticator.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { AppBar, Box, Button, Container, Link, Paper, Toolbar, Typography } from '@mui/material';
import HeaderFullWidth from './HeaderFullWidth';
import AlertInfoBar from './AlertInfoBar';

const REACT_APP_DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REACT_APP_DISCORD_REDIRECT_URL = process.env.REACT_APP_DISCORD_REDIRECT_URL as string;
const REACT_APP_BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const REACT_APP_DISCORD_BOT_API_URL = process.env.REACT_APP_DISCORD_BOT_API_URL;

declare global {
    interface Window {
        ethereum: any;
    }
}

const getQueryParam = (name: string, url: string) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(url);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function DiscordAuthenticator() {
    const [authorizationCode, setAuthorizationCode] = useState<string | null>(
        getQueryParam('code', window.location.href)
    );    
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setUserAddress(accounts[0]);
            });
        }
    }, []);

    const handleLogin = () => {
        window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${REACT_APP_DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REACT_APP_DISCORD_REDIRECT_URL)}&response_type=code&scope=identify%20email%20guilds.join`;
        
    };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(window.ethereum);
                setUserAddress((await web3.eth.getAccounts())[0]);
                setError(null);  // clear any previous errors
            } catch (err) {
                console.log(err);
                if (err instanceof Error) {
                    setError(err.message);
                } else if (err && typeof err === 'object' && 'message' in err) {
                    setError(err.message as string);
                } else {
                    setError('Failed to connect wallet');
                }
            }
        } else {
            setError('Ethereum object does not exist. Install a Web3 browser.');
        }
    }

    const signMessage = async () => {
        if (window.ethereum && userAddress && authorizationCode) {
            const web3 = new Web3(window.ethereum);
    
            // Generate a random nonce.
            const nonce = Math.floor(Math.random() * 1e16); // or use any other method you like
    
            const message = `Please sign this message to confirm your address. Nonce: ${nonce}`;
    
            const signature = await web3.eth.personal.sign(message, userAddress, '');
            console.log('Signature:', signature);
    
            // Send the nonce to the server as well.
            const response = await fetch(`${REACT_APP_BACKEND_URL}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ signature, message, userAddress, nonce, authorizationCode }),
            });

            const data = await response.json();
            console.log(data);

            if (data.isValid) {
                setIsVerified(true);
                setError(null);
            
                // Send the verification data to the Discord bot
                try {
                    const botResponse = await fetch(`${REACT_APP_DISCORD_BOT_API_URL}/authenticate`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code: authorizationCode, userAddress }),
                    });
            
                    const botData = await botResponse.json();
            
                    if (botData.isValid) {
                        // The bot successfully verified the user
                    } else {
                        // The bot could not verify the user
                        setError(botData.message);
                    }
                } catch (err) {
                    console.log(err);
                    if (err instanceof Error) {
                        setError(err.message);
                    } else if (err && typeof err === 'object' && 'message' in err) {
                        setError(err.message as string);
                    } else {
                        setError('Failed to verify with the bot');
                    }
                }
            } else {
                setIsVerified(false);
                setError(data.message);
            }
        }
    };    

    return (
        <Box>
            <HeaderFullWidth />
            <AlertInfoBar />
            <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Paper sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }} elevation={3}>
                    {!authorizationCode ? (
                        <>
                            <Typography component="h1" variant="h5">
                                Verify your Discord Account
                            </Typography>
                            <Typography component="p" sx={{mt:2}} color="secondary">
                                To gain access to gated roles, you need to Login with Discord, then connect and verify your wallet so the Ferrum Authenticator can assign you the appropriate gated role.
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
                        </>
                    ) : (
                        <>
                            <Typography component="h1" variant="h5">
                                Connect Your Wallet
                            </Typography>
                            <Box
                                sx={{ width: '100%', mt: 1 }}
                            >
                                {!userAddress ? (
                                    <Button
                                        onClick={connectWallet}
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Connect Wallet
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={signMessage}
                                        fullWidth
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mt: 3, mb: 2 }}
                                    >
                                        Verify Address by Signature
                                    </Button>
                                )}
                                {error && <Typography color="error">{error}</Typography>}
                                {userAddress && <Typography>Connected account: {userAddress}</Typography>}
                                {isVerified && <Typography color="success.main">Address has been successfully verified!</Typography>}
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default DiscordAuthenticator;