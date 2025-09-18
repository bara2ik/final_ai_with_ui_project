import React, { useState } from "react";

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
        padding: "30px",
        borderRadius: "16px",
        backgroundColor: "#2a2a2a",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        border: "1px solid #404040",
        animation: "slideInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
      ref={(el) => {
        if (el) {
          // Inject container animation keyframes
          if (!document.querySelector('#containerAnimationKeyframes')) {
            const style = document.createElement('style');
            style.id = 'containerAnimationKeyframes';
            style.textContent = `
              @keyframes slideInUp {
                0% {
                  opacity: 0;
                  transform: translateY(40px) scale(0.95);
                }
                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
              
              @keyframes slideInLeft {
                0% {
                  opacity: 0;
                  transform: translateX(-30px);
                }
                100% {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              
              @keyframes buttonPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
              }
            `;
            document.head.appendChild(style);
          }
        }
      }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "#fff", 
          margin: "0 0 30px 0",
          fontSize: "28px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>House Price Prediction</h1>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          {Object.keys(formData).map((key) => (
            <div key={key} style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "8px",
              animation: `slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${Object.keys(formData).indexOf(key) * 0.1}s backwards`
            }}>
              <label 
                htmlFor={key}
                style={{
                  color: "#f0f0f0",
                  fontSize: "15px",
                  fontWeight: "600",
                  textTransform: "capitalize",
                  marginBottom: "4px",
                  letterSpacing: "0.3px"
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
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "2px solid #404040",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#3a3a3a",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    willChange: "transform, box-shadow, border-color"
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007bff";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0, 123, 255, 0.15), 0 4px 12px rgba(0, 123, 255, 0.2)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#404040";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <option value="" style={{ backgroundColor: "#3a3a3a", color: "#ccc" }}>Select a neighborhood</option>
                  <option value="Downtown" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Downtown</option>
                  <option value="Suburbs" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Suburbs</option>
                  <option value="Waterfront" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Waterfront</option>
                  <option value="Historic" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Historic</option>
                  <option value="New Development" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>New Development</option>
                  <option value="Rural" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Rural</option>
                  <option value="Industrial" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Industrial</option>
                  <option value="University Area" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>University Area</option>
                </select>
              ) : key === "property_type" ? (
                <select
                  id={key}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "2px solid #404040",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#3a3a3a",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    willChange: "transform, box-shadow, border-color"
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007bff";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0, 123, 255, 0.15), 0 4px 12px rgba(0, 123, 255, 0.2)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#404040";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  <option value="" style={{ backgroundColor: "#3a3a3a", color: "#ccc" }}>Select property type</option>
                  <option value="Single Family" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Single Family</option>
                  <option value="Townhouse" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Townhouse</option>
                  <option value="Condo" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Condo</option>
                  <option value="Duplex" style={{ backgroundColor: "#3a3a3a", color: "#fff" }}>Duplex</option>
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
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "2px solid #404040",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#3a3a3a",
                    color: "#fff",
                    fontSize: "14px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    outline: "none",
                    willChange: "transform, box-shadow, border-color"
                  }}
                  onMouseEnter={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007bff";
                    e.target.style.boxShadow = "0 0 0 4px rgba(0, 123, 255, 0.15), 0 4px 12px rgba(0, 123, 255, 0.2)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#404040";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            style={{
              padding: "14px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#007bff",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
              width: "100%",
              fontSize: "16px",
              marginTop: "16px",
              boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)",
              transition: "all 0.3s ease",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              animation: "buttonPulse 3s ease-in-out infinite"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0056b3";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
              e.target.style.animation = "none"; // Pause pulse on hover
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#007bff";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 123, 255, 0.3)";
              e.target.style.animation = "buttonPulse 3s ease-in-out infinite"; // Resume pulse
            }}
            onMouseDown={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "translateY(-2px)";
            }}
          >
            Predict Price
          </button>
        </form>

        {predPrice !== null && (
          <div
            key={predPrice}  // Force re-render to trigger animation
            style={{ 
              textAlign: "center", 
              marginTop: "30px", 
              padding: "20px", 
              background: "linear-gradient(135deg, #007bff 0%, #0056b3 100%)",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "700",
              boxShadow: "0 6px 20px rgba(0, 123, 255, 0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              letterSpacing: "0.5px",
              opacity: 0,
              transform: "scale(0.8) translateY(20px)",
              animation: "0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              animationName: "fadeInScale"
            }}
            ref={(el) => {
              if (el) {
                // Inject keyframes into document head
                if (!document.querySelector('#fadeInScaleKeyframes')) {
                  const style = document.createElement('style');
                  style.id = 'fadeInScaleKeyframes';
                  style.textContent = `
                    @keyframes fadeInScale {
                      0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(20px);
                      }
                      50% {
                        opacity: 0.8;
                        transform: scale(1.05) translateY(-5px);
                      }
                      100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                      }
                    }
                  `;
                  document.head.appendChild(style);
                }
              }
            }}
          >
            🏠 Predicted Price: ${predPrice.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
