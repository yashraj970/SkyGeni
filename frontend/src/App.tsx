import React from "react";
import { Box, Container } from "@mui/material";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Header />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Dashboard />
      </Container>
    </Box>
  );
};

export default App;
