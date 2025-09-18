import React, { useState } from "react";
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Button 
} from '@mui/material';

// Create MUI theme that matches our existing design
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
    text: {
      primary: '#ffffff',
    },
  },
  components: {
    // Customize MUI components to match our styling
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1e1e1e',
        },
      },
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
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: "#1e1e1e",
          padding: "20px 10px"
        }}
      >
      <div style={{ 
        maxWidth: "400px", 
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#2a2a2a"
      }}>
        <h1 style={{ textAlign: "center", color: "#fff", margin: "0 0 20px 0" }}>House Price Prediction</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label 
                htmlFor={key}
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  textTransform: "capitalize"
                }}
              >
                {key.replace(/_/g, " ")}
              </label>
              {key === "neighborhood" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                    color: "#000",
                    cursor: "pointer"
                  }}
                >
                  <option value="" style={{ color: "#000" }}>Select a neighborhood</option>
                  <option value="Downtown" style={{ color: "#000" }}>Downtown</option>
                  <option value="Suburbs" style={{ color: "#000" }}>Suburbs</option>
                  <option value="Waterfront" style={{ color: "#000" }}>Waterfront</option>
                  <option value="Historic" style={{ color: "#000" }}>Historic</option>
                  <option value="New Development" style={{ color: "#000" }}>New Development</option>
                  <option value="Rural" style={{ color: "#000" }}>Rural</option>
                  <option value="Industrial" style={{ color: "#000" }}>Industrial</option>
                  <option value="University Area" style={{ color: "#000" }}>University Area</option>
                </select>
              ) : key === "property_type" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                    color: "#000",
                    cursor: "pointer"
                  }}
                >
                  <option value="" style={{ color: "#000" }}>Select property type</option>
                  <option value="Single Family" style={{ color: "#000" }}>Single Family</option>
                  <option value="Townhouse" style={{ color: "#000" }}>Townhouse</option>
                  <option value="Condo" style={{ color: "#000" }}>Condo</option>
                  <option value="Duplex" style={{ color: "#000" }}>Duplex</option>
                </select>
              ) : (
                <input
                  id={key}
                  name={key}
                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                  value={formData[key]}
                  onChange={handleChange}
                  type={["rooms","area","days_on_market","sale_year","sale_month","sale_quarter"].includes(key) ? "number" : "text"}
                  step={["bathrooms","age","garage_spaces","lot_size","school_rating"].includes(key) ? "0.01" : undefined}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />
              )}
            </div>
          ))}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ 
              mt: 1,
              py: 1.5,
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            Predict Price
          </Button>
        </form>

        {predPrice !== null && (
          <div style={{ 
            textAlign: "center", 
            marginTop: "20px", 
            padding: "15px", 
            backgroundColor: "#007bff", 
            borderRadius: "8px",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold"
          }}>
            Predicted Price: ${predPrice.toLocaleString()}
          </div>
        )}
      </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
