"""
Housing Price Prediction - CatBoost Training & Prediction Script
Applies feature engineering via feature_engineering.py, then trains and evaluates the model.
"""

import os
import json
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ── Import feature engineering module ─────────
from feature_engineering import build_features, get_feature_columns, CAT_FEATURES

# ─────────────────────────────────────────────
# 1. Load data
# ─────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
TRAIN_PATH = os.path.join(BASE_DIR, "data", "House Price Dataset.csv")
TEST_PATH  = os.path.join(BASE_DIR, "data", "Test Data For Prediction.csv")

train_df = pd.read_csv(TRAIN_PATH)
test_df  = pd.read_csv(TEST_PATH)

print(f"Training set shape: {train_df.shape}")
print(f"Test set shape: {test_df.shape}")

# ─────────────────────────────────────────────
# 2. Feature engineering (via feature_engineering.py)
# ─────────────────────────────────────────────
train_feat = build_features(train_df)
test_feat  = build_features(test_df)

FEATURE_COLS = get_feature_columns(train_feat)
TARGET_COL   = "price"

print(f"\nFeature columns ({len(FEATURE_COLS)}): {FEATURE_COLS}")
print(f"Categorical features: {CAT_FEATURES}")

# ─────────────────────────────────────────────
# 3. Split into training / validation sets
# ─────────────────────────────────────────────
X      = train_feat[FEATURE_COLS]
y      = train_feat[TARGET_COL]
X_test = test_feat[FEATURE_COLS]

X_train, X_val, y_train, y_val = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"Train: {X_train.shape[0]}  Val: {X_val.shape[0]}  Test: {X_test.shape[0]}")

# ─────────────────────────────────────────────
# 4. Build CatBoost Pools
# ─────────────────────────────────────────────
train_pool = Pool(data=X_train, label=y_train, cat_features=CAT_FEATURES)
val_pool   = Pool(data=X_val,   label=y_val,   cat_features=CAT_FEATURES)
test_pool  = Pool(data=X_test,  cat_features=CAT_FEATURES)

# ─────────────────────────────────────────────
# 5. Train CatBoost model
# ─────────────────────────────────────────────
model = CatBoostRegressor(
    iterations=500,
    learning_rate=0.05,
    depth=6,
    l2_leaf_reg=3.0,
    random_seed=39,
    eval_metric="RMSE",
    early_stopping_rounds=100,
    verbose=100,
)

print("\nTraining CatBoost model ...")
model.fit(train_pool, eval_set=val_pool, use_best_model=True)

# ─────────────────────────────────────────────
# 6. Model evaluation
# ─────────────────────────────────────────────
val_pred = model.predict(val_pool)

mae  = mean_absolute_error(y_val, val_pred)
rmse = np.sqrt(mean_squared_error(y_val, val_pred))
r2   = r2_score(y_val, val_pred)

print(f"\n-- Validation Set Evaluation -----------------")
print(f"  MAE  : {mae:,.2f}")
print(f"  RMSE : {rmse:,.2f}")
print(f"  R2   : {r2:.4f}")

# ─────────────────────────────────────────────
# 7. Feature importance
# ─────────────────────────────────────────────
importance = (
    pd.Series(model.get_feature_importance(), index=FEATURE_COLS)
    .sort_values(ascending=False)
)
print(f"\n-- Feature Importance (Top 10) -----------------")
for feat, imp in importance.head(10).items():
    print(f"  {feat:<35} {imp:.2f}")

# ─────────────────────────────────────────────
# 8. Predict on test set
# ─────────────────────────────────────────────
test_pred = model.predict(test_pool)
test_result = test_df.copy()
test_result["predicted_price"] = test_pred.round(2)

RESULT_PATH = os.path.join(BASE_DIR, "data", "prediction_result.csv")
test_result.to_csv(RESULT_PATH, index=False)
print(f"\nPrediction results saved to: {RESULT_PATH}")
print(test_result.to_string(index=False))

# ─────────────────────────────────────────────
# 9. Save model
# ─────────────────────────────────────────────
MODEL_PATH = os.path.join(BASE_DIR, "model", "catboost_model.cbm")
MODEL_INFO_PATH = os.path.join(BASE_DIR, "model", "model_info.json")
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
model.save_model(MODEL_PATH)
print(f"\nModel saved to: {MODEL_PATH}")

# ─────────────────────────────────────────────
# 10. Save model metadata
# ─────────────────────────────────────────────
model_info = {
    "model_name": model.__class__.__name__,
    "params": {
        "iterations": model.get_params().get("iterations"),
        "depth": model.get_params().get("depth"),
        "learning_rate": model.get_params().get("learning_rate"),
        "l2_leaf_reg": model.get_params().get("l2_leaf_reg"),
        "random_seed": model.get_params().get("random_seed"),
    },
    "evaluation": {
        "MAE": round(float(mae), 2),
        "RMSE": round(float(rmse), 2),
        "R2": round(float(r2), 4),
    },
    "feature_importance": {
        feat: round(float(imp), 2)
        for feat, imp in importance.items()
    },
}

with open(MODEL_INFO_PATH, "w", encoding="utf-8") as f:
    json.dump(model_info, f, ensure_ascii=False, indent=2)
print(f"Model metadata saved to: {MODEL_INFO_PATH}")
