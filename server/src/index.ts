// server/src/index.ts

import express from 'express';
import cors from "cors";
import Web3 from 'web3';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;
const web3 = new Web3();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express.js!');
});

app.post('/verify', (req, res) => {
    const { signature, message, userAddress, nonce } = req.body;
    
    try {
        // Verify that the message includes the nonce
        const expectedMessage = `Please sign this message to confirm your address. Nonce: ${nonce}`;

        if (message !== expectedMessage) {
            return res.status(400).json({ isValid: false, message: 'Invalid message. Nonce does not match.' });
        }

        const recoveredAddress = web3.eth.accounts.recover(message, signature);

        if (recoveredAddress.toLowerCase() === userAddress.toLowerCase()) {
            res.json({ isValid: true, message: 'Address is successfully verified!' });
        } else {
            res.json({ isValid: false, message: 'Address verification failed.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

