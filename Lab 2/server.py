####################################################################################
 
# IMPORT PACKAGES

import requests
from flask import Flask, render_template, request, jsonify
from sklearn.decomposition import PCA
import numpy as np

from sklearn.cluster import KMeans
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler, PowerTransformer
import pandas as pd


####################################################################################

app = Flask(__name__)

####################################################################################

# IMPORT DATA AND PRE-PROCESS

url = 'https://raw.githubusercontent.com/DeepshikaR/VisLab/main/CountryData.csv'

response = requests.get(url)
data = []

if response.status_code == 200:
    data = pd.read_csv(url)
else:
    print('Failed to retrieve data:', response.status_code)

# Uncomment to use local dataset
# data = pd.read_csv("CountryData.csv")
    
# Changing column names
data.columns = ["country", "child_mortality", "exports", "health_spending", "imports",
                  "income", "inflation", "life_expectancy", "total_fertility", "GDP_per_capita"]
# List of Attributes used
colNames = ["Child Mortality", "Exports", "Health Spending", "Imports",
                  "Income", "Inflation", "Life Expectancy", "Total Fertility", "GDP per capita"]

# Converting Data to Absolute Values
data['exports'] = (data['exports'] / 100) * data['GDP_per_capita']
data['imports'] = (data['imports'] / 100) * data['GDP_per_capita']
data['health_spending'] = (data['health_spending'] / 100) * data['GDP_per_capita']

# Scaling Data
scaler = StandardScaler(with_mean=True, with_std=True, copy=True)
cols = ['child_mortality', 'exports', 'health_spending', 'imports', 'income', 'inflation', 
        'life_expectancy', 'total_fertility', 'GDP_per_capita']
modData = data.copy()
modData[cols] = scaler.fit_transform(modData[cols])

# Drop attribute 'country'
X = modData.drop(labels='country', axis=1)


####################################################################################


# Global Attributes
num_clusters = -1
intrinsic_dim = -1
num_components = -1


####################################################################################


# Get Data from Client, process, send results back to Client

# Main Dashboard
@app.route('/')
def index():
    return render_template('/index.html')


# PCA for Scree Plot
@app.route('/pca', methods=['POST'])
def pca():
    global num_components
    num_components = int(request.form['num_components'])
    
    pca = PCA(n_components=num_components)
    X_pca = pca.fit_transform(X)

    explained_variance_ratio = pca.explained_variance_ratio_
    explained_variance_ratio = np.multiply(explained_variance_ratio,100)
    eigenvalues = pca.explained_variance_
    cum_explained_variance = np.cumsum(explained_variance_ratio)
    data = {
        'X_pca': X_pca.tolist(),
        'explained_variance_ratio': explained_variance_ratio.tolist(),
        'eigenvalues': eigenvalues.tolist(),
        'cum_explained_variance': cum_explained_variance.tolist()
    }

    return jsonify(data)


# MSE of K-Means Clustering
@app.route('/kmeans_mse', methods=['POST'])
def kmeans_mse():
    k = int(request.form['num_clusters'])

    # Compute MSE for different values of k
    mse_values = []
    for i in range(1, k + 1):
        kmeans = KMeans(n_clusters=i, random_state=42)
        kmeans.fit(X)
        centroids = kmeans.cluster_centers_
        labels = kmeans.labels_
        mse = mean_squared_error(X, centroids[labels])
        mse_values.append(mse)

    mse = np.array(mse_values)
    data = {
        'mse':mse.tolist()
    }

    return jsonify(data)


# Set No. of Clusters (k)
@app.route('/set_k', methods=['POST'])
def set_num_clusters():
    global num_clusters
    num_clusters = int(request.json['k'])
    print("\n\nSet num_clusters to: ", num_clusters)
    return jsonify(
        {'message': f'num_clusters dimension set to {num_clusters}'}), 200


# Set Intrinsic Dimensionality Index (di)
@app.route('/set_di', methods=['POST'])
def set_intrinsic_dim():
    global intrinsic_dim
    intrinsic_dim = int(request.json['di'])
    print("\n\nSet intrinsic dim to: ", intrinsic_dim)
    return jsonify({'message':
                    f'Intrinsic dimension set to {intrinsic_dim}'}), 200


# PCA-based Biplot
@app.route('/pca_biplot', methods=['POST'])
def pca_biplot():
    global num_clusters,intrinsic_dim

    power_transformer = PowerTransformer(method='yeo-johnson')
    X_s = power_transformer.fit_transform(X)

    pca = PCA(n_components=num_components)
    X_pca = pca.fit_transform(X_s)

    components = pca.components_.T

    kmeans = KMeans(n_clusters=num_clusters, random_state=42)
    kmeans.fit(X_pca)
    cluster_labels = kmeans.labels_

    data = {
        'X_pca': X_pca.tolist(),
        'pca_components': components.tolist(),
        'cluster_labels': cluster_labels.tolist(),
        'feature_names': colNames
    }

    return jsonify(data)


# Finding Top 4 Attributes for Chosen di
@app.route('/top_four', methods=['POST'])
def pca_top():
    global num_clusters,intrinsic_dim
        
    power_transformer = PowerTransformer(method='yeo-johnson')
    X_s = power_transformer.fit_transform(X)

    pca = PCA(n_components=intrinsic_dim)
    X_pca = pca.fit_transform(X_s)
    components = pca.components_.T
    selected_components = components[:, :intrinsic_dim]
    loading_scores = np.sqrt(np.sum(selected_components**2, axis=1))
    sorted_indices = np.argsort(loading_scores)[::-1]
    sorted_loading_scores = np.sort(loading_scores)[::-1]
    sorted_loading_scores = np.round(sorted_loading_scores, decimals=3)
    most_important_columns = [colNames[i] for i in sorted_indices]

    # Send standardized PCA-transformed data, PCA components, and feature names back to frontend
    data = {
        'most_important_columns': most_important_columns,
        'loading_scores': sorted_loading_scores.tolist(),
    }

    return jsonify(data)


# Scatterplot Matrix
@app.route('/scatter_matrix', methods=['POST'])
def generate_scatter_matrix():
    global num_clusters, intrinsic_dim

    power_transformer = PowerTransformer(method='yeo-johnson')
    X_s = power_transformer.fit_transform(X)

    pca = PCA(n_components=intrinsic_dim)
    X_pca = pca.fit_transform(X_s)
    components = pca.components_.T
    selected_components = components[:, :intrinsic_dim]
    loading_scores = np.sqrt(np.sum(selected_components**2, axis=1))
    sorted_indices = np.argsort(loading_scores)[::-1]
    most_important_columns = [colNames[i] for i in sorted_indices[:4]]  
    print(most_important_columns)

    df = X.rename(columns=dict(zip(X.columns, colNames)))
   
    df = df[most_important_columns]   # Extracting top 4 columns

    # Perform KMeans clustering for each scatter plot
    kmeans_models = {}
    for i, xColumn in enumerate(df.columns):
        for j, yColumn in enumerate(df.columns):
            if i != j:
                combined_data = df[[xColumn, yColumn]]
                kmeans = KMeans(n_clusters=num_clusters, random_state=42)
                kmeans.fit(combined_data)
                kmeans_models[(xColumn, yColumn)] = kmeans

    # Get cluster labels for each data point
    cluster_labels = {}
    for (xColumn, yColumn), kmeans in kmeans_models.items():
        combined_data = df[[xColumn, yColumn]]
        cluster_labels[(xColumn, yColumn)] = kmeans.predict(combined_data).tolist()

    scatter_data = df.to_dict(orient='records')

    cluster_labels_str = {str(key): value for key, value in cluster_labels.items()}

    data = {
        'scatter_data': scatter_data,
        'cluster_labels': cluster_labels_str
    }
    return jsonify(data)


####################################################################################


if __name__ == '__main__':
    app.run(debug=True)


####################################################################################