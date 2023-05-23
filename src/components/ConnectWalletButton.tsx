// src/components/ConnectWalletButton.tsx
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { AppBar, Box, Button, Container, Link, Paper, Toolbar, Typography } from '@mui/material';
import HeaderFullWidth from './HeaderFullWidth';

declare global {
    interface Window {
        ethereum: any;
    }
}

function ConnectWalletButton() {
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
        if (window.ethereum && userAddress) {
            const web3 = new Web3(window.ethereum);
    
            // Generate a random nonce.
            const nonce = Math.floor(Math.random() * 1e16); // or use any other method you like
    
            const message = `Please sign this message to confirm your address. Nonce: ${nonce}`;
    
            const signature = await web3.eth.personal.sign(message, userAddress, '');
            console.log('Signature:', signature);
    
            // Send the nonce to the server as well.
            const response = await fetch('http://localhost:8081/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ signature, message, userAddress, nonce }),
            });
    
            const data = await response.json();
            console.log(data);
    
            if (data.isValid) {
                setIsVerified(true);
                setError(null);
            } else {
                setIsVerified(false);
                setError(data.message);
            }
        }
    };    

    return (
        <Box>
            <HeaderFullWidth />
            <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Paper sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }} elevation={3}>
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
                </Paper>
            </Container>
        </Box>
    );
}

export default ConnectWalletButton;
