import Navbar from "../components/Navbar";
import { Box, Button, Container, Typography } from "@mui/material";

export default function Home() {
  return (
    <>
      <Navbar />

      <Box
        sx={{
          backgroundColor: "#F5F0E8",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 2,
            }}
          >
            নবME
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
            }}
          >
            Build Your Story.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              maxWidth: 600,
              mb: 4,
            }}
          >
            Bengali inspired premium fashion for Men,
            Women, Unisex and Accessories.
          </Typography>

          <Button
            variant="contained"
            size="large"
            href="/category"
            sx={{
              backgroundColor: "#111",
            }}
          >
            Shop Now
          </Button>
        </Container>
      </Box>
    </>
  );
}