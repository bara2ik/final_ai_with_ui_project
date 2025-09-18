import React, { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box
} from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007bff',
    },
    background: {
      default: '#1e1e1e',
      paper: '#2a2a2a',
    },
  },
});

function App() {
  const [formData, setFormData] = useState({
    neighborhood: "",
    property_type: "",
    rooms: "",
    bathrooms: "",
    area: "",
    age: "",
    garage_spaces: "",
    lot_size: "",
    school_rating: "",
    days_on_market: "",
    sale_year: "",
    sale_month: "",
    sale_quarter: ""
  });

  const [predPrice, setPredPrice] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://10.0.33.94:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          neighborhood: formData.neighborhood,
          property_type: formData.property_type,
          rooms: parseInt(formData.rooms),
          bathrooms: parseFloat(formData.bathrooms),
          area: parseInt(formData.area),
          age: parseFloat(formData.age),
          garage_spaces: parseFloat(formData.garage_spaces),
          lot_size: parseFloat(formData.lot_size),
          school_rating: parseFloat(formData.school_rating),
          days_on_market: parseInt(formData.days_on_market),
          sale_year: parseInt(formData.sale_year),
          sale_month: parseInt(formData.sale_month),
          sale_quarter: parseInt(formData.sale_quarter)
        }),
      });

      const data = await response.json();
      setPredPrice(data.predicted_price);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            maxHeight: '90vh', 
            overflowY: 'auto',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            House Price Prediction
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {Object.keys(formData).map((key) => (
              <Box key={key} sx={{ mb: 2 }}>
                {key === "neighborhood" ? (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Neighborhood</InputLabel>
                    <Select
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      label="Neighborhood"
                    >
                      <MenuItem value="">Select a neighborhood</MenuItem>
                      <MenuItem value="Downtown">Downtown</MenuItem>
                      <MenuItem value="Suburbs">Suburbs</MenuItem>
                      <MenuItem value="Waterfront">Waterfront</MenuItem>
                      <MenuItem value="Historic">Historic</MenuItem>
                      <MenuItem value="New Development">New Development</MenuItem>
                      <MenuItem value="Rural">Rural</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                      <MenuItem value="University Area">University Area</MenuItem>
                    </Select>
                  </FormControl>
                ) : key === "property_type" ? (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      label="Property Type"
                    >
                      <MenuItem value="">Select property type</MenuItem>
                      <MenuItem value="Single Family">Single Family</MenuItem>
                      <MenuItem value="Townhouse">Townhouse</MenuItem>
                      <MenuItem value="Condo">Condo</MenuItem>
                      <MenuItem value="Duplex">Duplex</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name={key}
                    label={key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    placeholder={`Enter ${key.replace(/_/g, " ")}`}
                    value={formData[key]}
                    onChange={handleChange}
                    type={["rooms","area","days_on_market","sale_year","sale_month","sale_quarter"].includes(key) ? "number" : "text"}
                    inputProps={{
                      step: ["bathrooms","age","garage_spaces","lot_size","school_rating"].includes(key) ? "0.01" : undefined
                    }}
                    variant="outlined"
                  />
                )}
              </Box>
            ))}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, py: 1.5 }}
            >
              Predict Price
            </Button>
          </Box>

          {predPrice !== null && (
            <Paper 
              elevation={2}
              sx={{ 
                mt: 3, 
                p: 2, 
                textAlign: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText'
              }}
            >
              <Typography variant="h5" component="div">
                Predicted Price: ${predPrice.toLocaleString()}
              </Typography>
            </Paper>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
