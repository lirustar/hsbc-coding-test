"""
Feature Engineering Module
Provides feature building functions and constant definitions for the training script.
"""

import pandas as pd

# ─────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────
CURRENT_YEAR = 2026

# CatBoost categorical features
CAT_FEATURES = ["size_category", "age_category", "distance_category"]


# ─────────────────────────────────────────────
# Feature building function
# ─────────────────────────────────────────────
def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply feature engineering to the raw DataFrame and return the transformed feature matrix.

    Derived features:
        house_age                  - House age (current year - year built)
        sqft_per_bedroom           - Average area per bedroom
        sqft_per_bathroom          - Average area per bathroom
        total_rooms                - Total rooms (bedrooms + bathrooms)
        lot_to_house_ratio         - Lot size / house area ratio
        school_distance_interaction - School rating * distance to city center
        bedroom_ratio              - Bedroom ratio of total rooms
        is_new_house               - Whether built after 2000
        size_category              - Size bin (small / medium / large)
        age_category               - Age bin (new / mid / old)
        distance_category          - Distance bin (close / mid / far)
    """
    out = df.copy()

    # ── Derived numerical features ────────────
    # House age
    out["house_age"] = CURRENT_YEAR - out["year_built"]

    # Average area per bedroom
    out["sqft_per_bedroom"] = out["square_footage"] / out["bedrooms"].clip(lower=1)

    # Average area per bathroom
    out["sqft_per_bathroom"] = out["square_footage"] / out["bathrooms"].clip(lower=1)

    # Total rooms (bedrooms + bathrooms)
    out["total_rooms"] = out["bedrooms"] + out["bathrooms"]

    # Lot size / house area ratio
    out["lot_to_house_ratio"] = out["lot_size"] / out["square_footage"].clip(lower=1)

    # School rating * distance to city center (interaction feature)
    out["school_distance_interaction"] = (
        out["school_rating"] * out["distance_to_city_center"]
    )

    # Bedroom ratio of total rooms
    out["bedroom_ratio"] = out["bedrooms"] / out["total_rooms"].clip(lower=1)

    # Whether built after 2000
    out["is_new_house"] = (out["year_built"] >= 2000).astype(int)

    # ── Categorical features (binning) ────────
    # Size bin (small / medium / large)
    out["size_category"] = pd.cut(
        out["square_footage"],
        bins=[0, 1200, 1800, float("inf")],
        labels=["small", "medium", "large"],
    )

    # Age bin (new / mid / old)
    out["age_category"] = pd.cut(
        out["house_age"],
        bins=[0, 15, 30, float("inf")],
        labels=["new", "mid", "old"],
    )

    # Distance bin (close / mid / far)
    out["distance_category"] = pd.cut(
        out["distance_to_city_center"],
        bins=[0, 3, 6, float("inf")],
        labels=["close", "mid", "far"],
    )

    return out


def get_feature_columns(df: pd.DataFrame) -> list:
    """Return feature column names for model training (excluding id and price)."""
    return [c for c in df.columns if c not in ("id", "price")]
