import { Box, Title } from "@mantine/core";
import "./App.css";

function App() {
  return (
    <Box className="App">
      <header className="App-header">
        <img
          src="/static/images/logo-face.png"
          className="App-logo"
          alt="logo"
        />
        <Title size="80px" color="#fff">
          Roodle
        </Title>
        <Title size="40px" color="#94bdb7">
          Your Friendly Assistant
        </Title>
      </header>
    </Box>
  );
}

export default App;
