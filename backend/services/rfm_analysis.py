import pandas as pd
import datetime as dt
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

import os as _os
_BASE_DIR = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
MODEL_PATH = _os.path.join(_BASE_DIR, "segmentation_model.joblib")
SCALER_PATH = _os.path.join(_BASE_DIR, "scaler.joblib")

def perform_rfm_segmentation(df: pd.DataFrame):
    """
    Refined Hybrid Segmentation Model: 
    1. Attempts strict RFM calculation if columns exist.
    2. Falls back to generic numeric clustering if RFM columns are missing.
    """
    col_mapping = {}
    cols_lower = [str(c).lower() for c in df.columns]
    
    # 1. Detection of RFM-like columns
    id_terms = ['customerid', 'customer_id', 'id', 'user_id', 'userid', 'client_id']
    date_terms = ['invoicedate', 'date', 'timestamp', 'txn_date', 'order_date', 'created_at']
    amount_terms = ['totalamount', 'amount', 'sales', 'revenue', 'price', 'total', 'transaction_value']
    
    for term in id_terms:
        if term in cols_lower:
            col_mapping['CustomerID'] = df.columns[cols_lower.index(term)]
            break
            
    for term in date_terms:
        if term in cols_lower:
            col_mapping['InvoiceDate'] = df.columns[cols_lower.index(term)]
            break
            
    for term in amount_terms:
        if term in cols_lower:
            col_mapping['TotalAmount'] = df.columns[cols_lower.index(term)]
            break

    is_rfm_ready = all(k in col_mapping for k in ['CustomerID', 'InvoiceDate', 'TotalAmount'])

    # 2. Hybrid Processing Path
    if is_rfm_ready:
        # --- PATH A: RFM ANALYSIS ---
        df = df.dropna(subset=[col_mapping['CustomerID']])
        df[col_mapping['InvoiceDate']] = pd.to_datetime(df[col_mapping['InvoiceDate']], errors='coerce')
        df = df.dropna(subset=[col_mapping['InvoiceDate']])
        
        snapshot_date = df[col_mapping['InvoiceDate']].max() + dt.timedelta(days=1)
        
        features_df = df.groupby(col_mapping['CustomerID']).agg({
            col_mapping['InvoiceDate']: lambda x: (snapshot_date - x.max()).days,
            col_mapping['CustomerID']: 'count',
            col_mapping['TotalAmount']: 'sum'
        })
        
        features_df.rename(columns={
            col_mapping['InvoiceDate']: 'Recency',
            col_mapping['CustomerID']: 'Frequency',
            col_mapping['TotalAmount']: 'Monetary'
        }, inplace=True)
        
        features_df = features_df[(features_df['Monetary'] > 0) & (features_df['Recency'] >= 0)]
    else:
        # --- PATH B: GENERIC NUMERIC CLUSTERING (Fallback) ---
        # If not RFM, we cluster on all available numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_cols) < 2:
            raise ValueError("Dataset too simple for ML analysis. Ensure your file has at least 2 numeric columns (e.g., Price, Quantity, Score).")
            
        features_df = df[numeric_cols].copy()
        features_df = features_df.dropna()
        
        # Virtual ID for return consistency
        if 'CustomerID' not in col_mapping:
            features_df['CustomerID'] = features_df.index
            
        # Ensure we have Recency/Frequency/Monetary labels for the Frontend/Dashboard logic
        # We map existing numeric columns to these labels for UI consistency
        features_df['Recency'] = features_df[numeric_cols[0]]
        features_df['Frequency'] = features_df[numeric_cols[1]]
        features_df['Monetary'] = features_df[numeric_cols[-1]]

    # 3. Machine Learning Core
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(features_df[['Recency', 'Frequency', 'Monetary']])
    
    n_clusters = min(4, len(features_df))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    kmeans.fit(scaled_data)
    
    features_df['Cluster'] = kmeans.labels_
    
    # Semantic Tiering (sorted by the highest "Monetary" equivalent)
    cluster_means = features_df.groupby('Cluster')['Monetary'].mean().sort_values(ascending=False)
    tiers = ['Champions', 'Loyalists', 'At Risk', 'Hibernating'][:n_clusters]
    tier_mapping = {cluster_id: tier for cluster_id, tier in zip(cluster_means.index, tiers)}
    features_df['Tier'] = features_df['Cluster'].map(tier_mapping)

    # 4. Result Formatting
    summary = {
        "Total_Customers": int(len(features_df)),
        "Avg_Recency": round(float(features_df['Recency'].mean()), 2),
        "Avg_Frequency": round(float(features_df['Frequency'].mean()), 2),
        "Avg_Monetary": round(float(features_df['Monetary'].mean()), 2)
    }
    
    tier_distribution = features_df['Tier'].value_counts().to_dict()
    
    sample_size = min(500, len(features_df))
    scatter_data = features_df.reset_index().sample(sample_size).to_dict(orient='records')
    
    # Ensure IDs are strings for the frontend
    for item in scatter_data:
        if 'CustomerID' not in item:
            item['CustomerID'] = "R-" + str(np.random.randint(1000, 9999))
        else:
            item['CustomerID'] = str(item['CustomerID'])

    return {
        "metrics": summary,
        "distribution": tier_distribution,
        "scatter": scatter_data,
        "mode": "RFM" if is_rfm_ready else "Generic"
    }
