// src/App.tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectWalletButton from './components/ConnectWalletButton';
import theme from './theme';
import DiscordAuthenticator from './components/DiscordAuthenticator';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ConnectWalletButton />} />
          <Route path="/discord-authentication" element={<DiscordAuthenticator />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
