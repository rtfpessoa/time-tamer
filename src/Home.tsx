import { Box, Title } from "@mantine/core";
import "./Home.css";
import { Header } from "./header";
import { Footer } from "./footer";

function Home() {
  return (
    <Box style={{ minWidth: "540px" }}>
      <Header />
      <Box className="Home">
        <header
          className="Home-header"
          style={{ minHeight: "calc(100vh - 3.75rem)" }}
        >
          <img
            src="/static/images/logo-face.png"
            className="Home-logo"
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
      <Footer />
    </Box>
  );
}

export default Home;
