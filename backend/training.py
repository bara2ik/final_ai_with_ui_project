#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Train a house price prediction model on a synthetic dataset.
- Generates dataset
- Splits into train/test
- Trains Linear Regression (log-target) and Random Forest
- Evaluates with MAE, RMSE, R^2 (version-agnostic)
- Plots feature importances and diagnostics
- Saves Random Forest model to 'house_price_rf_model.joblib'

This script is resilient across scikit-learn versions (handles OneHotEncoder sparse/sparse_output and RMSE calc).
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import random
import argparse
import os

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.utils import shuffle
import joblib

# Try to import TransformedTargetRegressor; provide a fallback if unavailable
try:
    from sklearn.compose import TransformedTargetRegressor
    HAS_TTR = True
except Exception:
    HAS_TTR = False

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)
random.seed(RANDOM_STATE)

# ------------------------ Dataset generator ------------------------
def create_house_price_dataset(n_samples=5000):
    """Create a realistic synthetic house price dataset."""
    data = []

    neighborhoods = {
        'Downtown': {'base_price': 450000, 'multiplier': 1.3},
        'Suburbs': {'base_price': 350000, 'multiplier': 1.0},
        'Waterfront': {'base_price': 600000, 'multiplier': 1.5},
        'Historic': {'base_price': 400000, 'multiplier': 1.2},
        'New Development': {'base_price': 380000, 'multiplier': 1.1},
        'Rural': {'base_price': 250000, 'multiplier': 0.8},
        'University Area': {'base_price': 320000, 'multiplier': 0.95},
        'Industrial': {'base_price': 280000, 'multiplier': 0.85}
    }

    property_types = ['Single Family', 'Townhouse', 'Condo', 'Duplex']

    for i in range(n_samples):
        rooms = np.random.choice([2, 3, 4, 5, 6, 7], p=[0.05, 0.25, 0.35, 0.25, 0.08, 0.02])
        base_area = rooms * 250 + np.random.normal(200, 100)
        area = max(800, min(4000, base_area))

        if rooms <= 2:
            bathrooms = np.random.choice([1, 1.5, 2], p=[0.4, 0.4, 0.2])
        elif rooms <= 4:
            bathrooms = np.random.choice([1.5, 2, 2.5, 3], p=[0.1, 0.4, 0.3, 0.2])
        else:
            bathrooms = np.random.choice([2, 2.5, 3, 3.5, 4], p=[0.1, 0.2, 0.4, 0.2, 0.1])

        neighborhood = np.random.choice(list(neighborhoods.keys()))
        property_type = np.random.choice(property_types, p=[0.6, 0.15, 0.2, 0.05])

        age = np.random.exponential(15)
        age = min(100, max(0, age))

        garage = np.random.choice([0, 1, 2, 3], p=[0.1, 0.3, 0.5, 0.1])

        if neighborhood in ['Rural', 'Suburbs']:
            lot_size = np.random.gamma(2, 0.3)
        else:
            lot_size = np.random.gamma(1, 0.15)
        lot_size = min(2.0, max(0.1, lot_size))

        school_rating = np.random.normal(6.5, 1.5)
        school_rating = max(1, min(10, school_rating))

        days_on_market = np.random.exponential(30)
        days_on_market = min(365, max(1, days_on_market))

        neighborhood_info = neighborhoods[neighborhood]
        base_price = neighborhood_info['base_price']

        price = base_price
        price += (area - 1500) * 120
        price += (rooms - 3) * 15000
        price += (bathrooms - 2) * 8000

        if property_type == 'Condo':
            price *= 0.85
        elif property_type == 'Townhouse':
            price *= 0.92
        elif property_type == 'Duplex':
            price *= 0.88

        price *= (1 - age * 0.003)
        price += garage * 5000
        price += lot_size * 20000
        price += (school_rating - 5) * 8000
        price *= neighborhood_info['multiplier']

        price *= np.random.normal(1, 0.1)
        price = max(150000, min(1500000, price))
        price = round(price, -3)

        start_date = datetime.now() - timedelta(days=1095)
        sale_date = start_date + timedelta(days=np.random.randint(0, 1095))

        CURRENT_YEAR = datetime.now().year

        data.append({
            'rooms': rooms,
            'area': round(area),
            'bathrooms': bathrooms,
            'price': price,
            'neighborhood': neighborhood,
            'property_type': property_type,
            'age': round(age, 1),
            'garage_spaces': garage,
            'lot_size': round(lot_size, 2),
            'school_rating': round(school_rating, 1),
            'days_on_market': round(days_on_market),
            'sale_date': sale_date.strftime('%Y-%m-%d'),
            'year_built': CURRENT_YEAR - round(age)
        })

    return pd.DataFrame(data)

# ------------------------ Preprocessing ------------------------
def build_preprocessor(categorical_features, numeric_features):
    """Create a ColumnTransformer with version-agnostic OneHotEncoder."""
    # Version-agnostic OneHotEncoder: sklearn >=1.2 uses sparse_output; older uses sparse
    try:
        ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
    except TypeError:
        ohe = OneHotEncoder(handle_unknown='ignore', sparse=False)

    preprocess = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', ohe, categorical_features)
        ]
    )
    return preprocess

class LogTargetWrapper:
    """Fallback if TransformedTargetRegressor is missing."""
    def __init__(self, pipe):
        self.pipe = pipe
    def fit(self, X, y):
        self.pipe.fit(X, np.log1p(y))
        return self
    def predict(self, X):
        return np.expm1(self.pipe.predict(X))

# ------------------------ Utilities ------------------------
def evaluate_model(name, model, X_train, y_train, X_test, y_test):
    pred_tr = model.predict(X_train)
    pred_te = model.predict(X_test)

    mae_tr = mean_absolute_error(y_train, pred_tr)
    mae_te = mean_absolute_error(y_test, pred_te)

    rmse_tr = np.sqrt(mean_squared_error(y_train, pred_tr))
    rmse_te = np.sqrt(mean_squared_error(y_test, pred_te))

    r2_tr = r2_score(y_train, pred_tr)
    r2_te = r2_score(y_test, pred_te)

    print(f"\n{name}")
    print("=" * len(name))
    print(f"Train -> MAE: {mae_tr:,.0f} | RMSE: {rmse_tr:,.0f} | R^2: {r2_tr:.3f}")
    print(f"Test  -> MAE: {mae_te:,.0f} | RMSE: {rmse_te:,.0f} | R^2: {r2_te:.3f}")


def _get_ohe_feature_names(preprocess, categorical_features, numeric_features):
    ohe = preprocess.named_transformers_['cat']
    # Newer sklearn
    try:
        cat_names = list(ohe.get_feature_names_out(categorical_features))
    except Exception:
        # Older
        try:
            cat_names = list(ohe.get_feature_names(categorical_features))
        except Exception:
            # Fallback: categories_
            cat_names = []
            if hasattr(ohe, 'categories_'):
                for feat, cats in zip(categorical_features, ohe.categories_):
                    cat_names.extend([f"{feat}_{cat}" for cat in cats])
    return numeric_features + cat_names


def plot_feature_importance(fitted_rf_pipeline, categorical_features, numeric_features, top_n=20):
    preprocess = fitted_rf_pipeline.named_steps['preprocess']
    rf = fitted_rf_pipeline.named_steps['reg']

    if not hasattr(rf, 'feature_importances_'):
        print("This model does not provide feature_importances_. Skipping plot.")
        return

    all_feature_names = _get_ohe_feature_names(preprocess, categorical_features, numeric_features)
    importances = rf.feature_importances_

    feats = pd.DataFrame({'feature': all_feature_names, 'importance': importances})
    feats = feats.sort_values('importance', ascending=False).head(top_n)

    plt.figure(figsize=(9, max(4, top_n * 0.35)))
    sns.barplot(data=feats, y='feature', x='importance', color='#3b82f6')
    plt.title('Top Feature Importances (Random Forest)')
    plt.xlabel('Importance')
    plt.ylabel('Feature')
    plt.tight_layout()
    plt.show()


def plot_predictions(model, X_test, y_test, title='Actual vs Predicted'):
    preds = model.predict(X_test)
    plt.figure(figsize=(6,6))
    plt.scatter(y_test, preds, alpha=0.4, edgecolor='k')
    lims = [min(y_test.min(), preds.min()), max(y_test.max(), preds.max())]
    plt.plot(lims, lims, 'r--', lw=2)
    plt.xlabel('Actual Price')
    plt.ylabel('Predicted Price')
    plt.title(title)
    plt.tight_layout()
    plt.show()


def plot_residuals(model, X_test, y_test):
    preds = model.predict(X_test)
    resid = y_test - preds
    plt.figure(figsize=(6,4))
    sns.histplot(resid, kde=True, color='#10b981')
    plt.title('Residuals Distribution')
    plt.xlabel('Residual (Actual - Predicted)')
    plt.tight_layout()
    plt.show()

# ------------------------ Main ------------------------
def main(n_samples=5000, save_model_path='house_price_rf_model.joblib', no_plots=False):
    print("Generating house price dataset...")
    df = create_house_price_dataset(n_samples)

    # Shuffle and create time features
    df = shuffle(df, random_state=RANDOM_STATE).reset_index(drop=True)
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    df['sale_year']    = df['sale_date'].dt.year
    df['sale_month']   = df['sale_date'].dt.month
    df['sale_quarter'] = df['sale_date'].dt.quarter

    # Drop leakage / redundant columns
    df = df.drop(columns=['sale_date', 'year_built'])

    target_col = 'price'
    feature_cols = [c for c in df.columns if c != target_col]

    X = df[feature_cols]
    y = df[target_col]

    # Stratified split by price deciles
    y_bins = pd.qcut(y, q=10, labels=False, duplicates='drop')
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y_bins
    )

    categorical_features = ['neighborhood', 'property_type']
    numeric_features = [c for c in X_train.columns if c not in categorical_features]

    preprocess = build_preprocessor(categorical_features, numeric_features)

    # Baseline Linear Regression (log-target when available)
    lin_reg = Pipeline(steps=[
        ('preprocess', preprocess),
        ('reg', LinearRegression())
    ])

    if HAS_TTR:
        lin_model = TransformedTargetRegressor(
            regressor=lin_reg,
            func=np.log1p,
            inverse_func=np.expm1
        )
    else:
        lin_model = LogTargetWrapper(lin_reg)

    lin_model.fit(X_train, y_train)

    # Random Forest model
    rf_model = Pipeline(steps=[
        ('preprocess', preprocess),
        ('reg', RandomForestRegressor(
            n_estimators=500,
            random_state=RANDOM_STATE,
            n_jobs=-1
        ))
    ])
    rf_model.fit(X_train, y_train)

    # Evaluation
    evaluate_model("Linear Regression (log target)", lin_model, X_train, y_train, X_test, y_test)
    evaluate_model("Random Forest", rf_model, X_train, y_train, X_test, y_test)

    # Plots
    if not no_plots:
        plot_feature_importance(rf_model, categorical_features, numeric_features, top_n=20)
        plot_predictions(rf_model, X_test, y_test, title='RF: Actual vs Predicted')
        plot_residuals(rf_model, X_test, y_test)

    # Save model
    joblib.dump(rf_model, save_model_path)
    print(f"\nModel saved to '{save_model_path}'")

    # Inference demo
    current_year = datetime.now().year
    new_house = pd.DataFrame([{
        'rooms': 4,
        'area': 2200,
        'bathrooms': 2.5,
        'neighborhood': 'Suburbs',
        'property_type': 'Single Family',
        'age': 12.0,
        'garage_spaces': 2,
        'lot_size': 0.25,
        'school_rating': 7.5,
        'days_on_market': 30,
        'sale_year': current_year,
        'sale_month': 6,
        'sale_quarter': 2
    }])

    loaded_model = joblib.load(save_model_path)
    pred_price = loaded_model.predict(new_house)[0]
    print(f"Predicted price for new house: ${pred_price:,.0f}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train a house price prediction model.')
    parser.add_argument('--n-samples', type=int, default=5000, help='Number of synthetic samples to generate')
    parser.add_argument('--output', type=str, default='house_price_rf_model.joblib', help='Path to save the trained RF model')
    parser.add_argument('--no-plots', action='store_true', help='Disable plotting (useful for headless runs)')
    args = parser.parse_args()

    main(n_samples=args.n_samples, save_model_path=args.output, no_plots=args.no_plots)
