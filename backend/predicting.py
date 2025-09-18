import joblib
import pandas as pd
from datetime import datetime

# 1) Load the trained model
model = joblib.load('house_price_rf_model.joblib')

# 2) Prepare one new house sample (must include the same feature columns used in training)
#    If you prefer to pass a sale date, see Option 2 for helper to derive sale_year/month/quarter.
current_year = datetime.now().year
new_house = pd.DataFrame([{
    'rooms': 2,
    'area': 1000,
    'bathrooms': 2,
    'neighborhood': 'Waterfront',
    'property_type': 'Single Family',
    'age': 12.0,
    'garage_spaces': 2,
    'lot_size': 0.45,
    'school_rating': 5.5,
    'days_on_market': 30,
    'sale_year': current_year,
    'sale_month': 9,
    'sale_quarter': 3
}])

# 3) Predict
pred_price = model.predict(new_house)[0]
print(f"Predicted price: ${pred_price:,.0f}")
