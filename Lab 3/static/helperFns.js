/* ******************************************************************************  */

// Import Functions to Plot Graphs
import { screePlot, MSEChart, biplot, scatterPlot, mdsScatter, parallelPlot, mdsScatterVar } from "./plotGraphs.js";

/* ******************************************************************************  */

// Find Elbow in Graph
export function findElbowPoint(data) {
    let maxSlope = -1;
    let elbowIndex = -1;
    const y = data;

    for(let i = 1; i < data.length - 1; i++) {
        const slope = Math.abs(y[i] - y[i-1])/Math.abs(i - (i-1))
        if (slope > maxSlope) {
            maxSlope = slope;
            elbowIndex = i
        }
    }

    return elbowIndex+1;
}


/* ******************************************************************************  */


// Communicate with Python Server
async function fetchData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.json();
}


/* ******************************************************************************  */


// Update Top 4 Attributes from PCA
export async function updateTopFourAttr() {
    const response = await fetchData('/top_four', {});
    const fourCols = response.most_important_columns;
    const loadingScores = response.loading_scores;

    var table = document.getElementById('imp-columns');
    table.innerHTML = ''; 
    const init = `<tr><th>ATTRIBUTE</th>
                        <th>SCORE</th>
                </tr>`;
    table.insertAdjacentHTML('afterbegin', init);
    fourCols.forEach((col, index) => {
        const score = loadingScores[index];
        let row = `<tr>
                        <td>${col}</td>
                        <td>${score}</td>
                    </tr>`;
        if (index<4){
            row = `<tr style="font-weight:bold; color:blue">
                        <td>${col}</td>
                        <td>${score}</td>
                    </tr>`;
        }
                
        table.insertAdjacentHTML('beforeend', row);
    });
}


/* ******************************************************************************  */


// Update Biplot
export async function updateBiPlot(){
    const biplotForm = new URLSearchParams();
    biplotForm.append('num_components', 9); 
    const biplotData = await fetchData('/pca_biplot', biplotForm);
    biplot(biplotData);
};

// Update MDS-Scatter
export async function updateMdsScatter(){
    const mdsForm = new URLSearchParams();
    mdsForm.append('num_components', 9); 
    const mdsData = await fetchData('/mds_scatter', mdsForm);
    mdsScatter(mdsData);
    mdsScatterVar(mdsData);
};


// Update Scatterplot Matrix
export async function updateScatterMatrix(){
    const scatterForm = new URLSearchParams();
    scatterForm.append('num_components', 9); // Specify the number of components for biplot
    const ScatterData = await fetchData('/scatter_matrix', scatterForm);
    scatterPlot(ScatterData);
};

// Update Parallel-Coordinates Plot
export async function updatePCP(){
    const pcpForm = new URLSearchParams();
    pcpForm.append('num_components',9);
    const pcpData = await fetchData('/parallel_plot', pcpForm);
    parallelPlot(pcpData);
}


/* ******************************************************************************  */


// Generate All Plots on Initial Server Launch
document.addEventListener("DOMContentLoaded", async function() {

    // Scree Plot
    const pcaForm = new URLSearchParams();
    pcaForm.append('num_components', 9); // No. of components (attributes) for PCA 
    const pcaData = await fetchData('/pca', pcaForm);
    screePlot(pcaData);
    
    // k-means MSE Bar Chart
    const mseForm = new URLSearchParams();
    mseForm.append('num_clusters', 10); // Maximum Value of K
    const mseData = await fetchData('/kmeans_mse', mseForm);
    MSEChart(mseData);
    
    // PCA-based Biplot 
    updateBiPlot();

    // MDS Scatterplot
    updateMdsScatter();
    
    // Top 4 Attributes from PCA
    updateTopFourAttr();
    
    // Scatterplot Matrix of Top 4 Attributes
    updateScatterMatrix();

    // Parallel Coordinates Plot
    updatePCP();
        
    });


/* ******************************************************************************  */

