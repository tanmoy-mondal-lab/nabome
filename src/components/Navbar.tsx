import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#111",
        boxShadow: "none",
      }}
    >
      <Toolbar>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
          }}
        >
          নবME
        </Typography>

        <Box>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>

          <Button color="inherit" component={Link} to="/category">
            Shop
          </Button>

          <Button color="inherit" component={Link} to="/about">
            About
          </Button>

          <Button color="inherit" component={Link} to="/contact">
            Contact
          </Button>

          <Button color="inherit" component={Link} to="/cart">
            Cart
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}