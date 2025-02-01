/* ******************************************************************************  */

// Import Functions to help update Graphs
import { findElbowPoint, updateBiPlot, updateScatterMatrix, updateTopFourAttr } from "./helperFns.js";


/* ******************************************************************************  */


// Global Values
let screeIndex = -1; 
let mseIndex = -1;


/* ******************************************************************************  */


// Communicate with Python Server
async function sendData(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed sending data');
        }

        const result = await response.json();
        console.log(result.message); // Log the message from the backend
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Colors for Clusters
function colorOpts(label) {
    const colors = ["#800020", "#6A5ACD", "#008080", "#E2725B", "#608000", "#FFDB58", "#FF0080","black", "blue", "red"]; 
    return colors[label];
}


/* ******************************************************************************  */


// Scree Plot of EigenValues from PCA
export function screePlot(data) {

    d3.select("#pca-chart").selectAll("*").remove();
       
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    if(screeIndex === -1){
        screeIndex = findElbowPoint(data.explained_variance_ratio)
        const diForm = {
            di: screeIndex,
        };
        sendData('/set_di', diForm);
    }
    
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.explained_variance_ratio.map((d, i) => i + 1));

    const y = d3.scaleLinear()
        .range([height, 0])
        .nice()
        .domain([0, 100]);

    const svg = d3.select("#pca-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const barSpacing = 10; 
    const barWidth = x.bandwidth() - barSpacing;

    // Create bar chart
    const bars = svg.selectAll(".bar")
        .data(data.explained_variance_ratio)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i+1) + (barSpacing / 2))
        .attr("width", barWidth)
        .attr("y", d => y(d))
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => i === screeIndex-1? "#6A5ACD" : '#008060')
        .attr("barNo", (d, i) => i+1) // Attribute for di
        .on("mouseover", function() {
            d3.select(this).attr("fill", "#FFDB58");
        })
        .on("mouseout", function() {
            const index = +d3.select(this).attr("barNo"); 
            d3.select(this).attr("fill", index === screeIndex ? "#6A5ACD" : "#008060");
        })
        .on("click", function() {
            screeIndex = +d3.select(this).attr("barNo"); 
            const diForm = {
                di: screeIndex,
            };
            sendData('/set_di', diForm);
            updateBiPlot()
            updateTopFourAttr()
            updateScatterMatrix()
            screePlot(data); 
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Create scree plot
    svg.selectAll(".dot")
        .data(data.explained_variance_ratio)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", (d, i) => x(i+1) + x.bandwidth() / 2)
        .attr("cy", d => y(d))
        .attr("r", 5)
        .style("fill", "black");

    svg.selectAll(".dot-label")
        .data(data.explained_variance_ratio)
        .enter()
        .append("text")
        .attr("class", "dot-label")
        .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 2) 
        .attr("y", (d, i) => y(d) - 15) 
        .text(d => d.toFixed(2)) 
        .attr("text-anchor", "middle") 
        .attr("alignment-baseline", "middle") 
        .style("font-size", "15px") 
        .style("fill", "black"); 

    const line = d3.line()
        .x((d, i) => x(i+1) + x.bandwidth() / 2)
        .y(d => y(d))
        .curve(d3.curveLinear);

    const cumLine = d3.line()
        .x((d, i) => x(i + 1) + x.bandwidth() / 2)
        .y((d, i) => y(data.cum_explained_variance[i])); 

    svg.append("path")
        .datum(data.explained_variance_ratio)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("path")
        .datum(data.explained_variance_ratio)
        .attr("fill", "none")
        .attr("stroke", "#6A5ACD")
        .attr("stroke-width", 2)
        .attr("d", cumLine);

    svg.selectAll(".circle")
        .data(data.cum_explained_variance)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", (d, i) => x(i + 1) + x.bandwidth() / 2)
        .attr("cy", (d, i) => y(data.cum_explained_variance[i]))
        .attr("r", 4)
        .attr("fill", "#6A5ACD");

    svg.selectAll(".circle-label")
        .data(data.cum_explained_variance)
        .enter()
        .append("text")
        .attr("class", "circle-label")
        .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 2) 
        .attr("y", (d, i) => y(data.cum_explained_variance[i]) - 15) 
        .text(d => d.toFixed(2)) 
        .attr("text-anchor", "middle") 
        .attr("alignment-baseline", "middle") 
        .style("font-size", "15px") 
        .style("fill", "#6A5ACD"); 
    
    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top/2 })`)
        .style("text-anchor", "middle")
        .text("Principal Component");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Variance Explained (%)");

    svg.append("text")
        .attr('class','legend')
        .attr("x", width-120)
        .attr("y", margin.top + 30)
        .style("text-anchor", "middle")
        .text("Intrinsic Dimensionality = " + screeIndex);

}


/* ******************************************************************************  */


// Bar Chart of MSE from K-Means
export function MSEChart(data) {
    d3.select("#mse-chart").selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    if(mseIndex === -1){
        mseIndex = findElbowPoint(data.mse)
        const mseKForm = {
            k: mseIndex,
        };
        sendData('/set_k', mseKForm);

    }

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.mse.map((d, i) => i + 1));

    const y = d3.scaleLinear()
        .range([height, 0])
        .nice()
        .domain([0, d3.max(data.mse)]);

    const svg = d3.select("#mse-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const barSpacing = 10; 
    const barWidth = x.bandwidth() - barSpacing;

    // Create bar chart
    const bars = svg.selectAll(".bar")
        .data(data.mse)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i+1) + (barSpacing / 2))
        .attr("width", barWidth)
        .attr("y", d => y(d))
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => i === mseIndex-1? "#6A5ACD" : '#008060')
        .attr("barNo", (d, i) => i+1) // Attribute for K (clusters)
        .on("mouseover", function() {
            d3.select(this).attr("fill", "#FFDB58");
        })
        .on("mouseout", function() {
            const index = +d3.select(this).attr("barNo"); 
            
            d3.select(this).attr("fill", index === mseIndex ? "#6A5ACD" : '#008060');
        })
        .on("click", function() {
            mseIndex = +d3.select(this).attr("barNo"); 
            const mseKForm = {
                k: mseIndex,
            };
            sendData('/set_k', mseKForm);
            updateBiPlot()
            updateScatterMatrix()
            MSEChart(data); 
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".dot")
        .data(data.mse)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", (d, i) => x(i+1) + x.bandwidth() / 2)
        .attr("cy", d => y(d))
        .attr("r", 5)
        .style("fill", "black");

    svg.selectAll(".dot-label")
        .data(data.mse)
        .enter()
        .append("text")
        .attr("class", "dot-label")
        .attr("x", (d, i) => x(i + 1) + x.bandwidth() / 2) 
        .attr("y", (d, i) => y(d) - 10) 
        .text(d => d.toFixed(2)) 
        .attr("text-anchor", "middle") 
        .attr("alignment-baseline", "middle") 
        .style("font-size", "15px") 
        .style("fill", "black"); 

    const line = d3.line()
        .x((d, i) => x(i+1) + x.bandwidth() / 2)
        .y(d => y(d))
        .curve(d3.curveLinear);

    svg.append("path")
        .datum(data.mse)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top/2})`)
        .style("text-anchor", "middle")
        .text("Number of Clusters (k)");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Squared Error (MSE)");

    svg.append("text")
        .attr('class','legend')
        .attr("x", width-120)
        .attr("y", margin.top + 30)
        .style("text-anchor", "middle")
        .text("No. of Clusters, k = " + mseIndex);
     
}


/* ******************************************************************************  */


// PCA-Based Biplot
export function biplot(data){
    d3.select("#bi-plot").selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xRange = d3.extent(data.X_pca, d => d[0]);
    const yRange = d3.extent(data.X_pca, d => d[1]);
    const maxExtent = Math.max(Math.abs(xRange[0]), Math.abs(xRange[1]), Math.abs(yRange[0]), Math.abs(yRange[1]));

    const x = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([height, 0]);

    const svg = d3.select("#bi-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const arrowColors = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll(".point")
        .data(data.X_pca)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 3)
        .attr("fill", (d, i) => colorOpts(data.cluster_labels[i]));

    const arrowLengthScale = maxExtent;

    const scaledX_pca = data.pca_components.map(d => [d[0] * arrowLengthScale, d[1] * arrowLengthScale]);

    scaledX_pca.forEach((component, i) => {
        const color = arrowColors(i); 

        svg.append("line")
            .attr("class", "arrow")
            .attr("x1", width/2)
            .attr("y1", height/2)
            .attr("x2", x(component[0]))
            .attr("y2", y(component[1]))
            .attr("marker-end", "url(#arrowhead-" + i + ")")
            .style("stroke", color)
            .style("stroke-width", 2); 

        svg.append("text")
            .attr("x", width-120)
            .attr("y", height - height/3 + margin.top + 20 * i)
            .style("fill", color)
            .append("tspan") 
            .text(data.feature_names[i]);
        
        svg.append("defs").append("marker")
            .attr("id", "arrowhead-" + i)
            .attr("refX", 6)
            .attr("refY", 3)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,0 L0,6 L9,3 z")
            .style("stroke", color) 
            .style("fill", color); 

        svg.append("text")
            .attr("x", width)
            .attr("y", height/2 - 10)
            .attr("text-anchor", "end")
            .text("PC1");
    
        svg.append("text")
            .attr("x", width/2 + 20)
            .attr("y", height)
            .attr("text-anchor", "middle")
            .text("PC2");
    });

    svg.append("g")
        .attr("transform", `translate(0,${height/2})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${width / 2}, 0)`)
        .call(d3.axisLeft(y));

}


/* ******************************************************************************  */


// Scatter Plot Matrix
export function scatterPlot(data) {
    d3.select("#scatter-plot").selectAll("*").remove();

    const margin = { top: 50, right: 20, bottom: 50, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 1000 - margin.top - margin.bottom;

    const scatterSize = 167;
    const padding = 10;
    const gridStroke = "darkgray";

    const columns = Object.keys(data.scatter_data[0]);

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    for (let i = 0; i < columns.length + 1; i++) {
        const xPos = i * scatterSize;
        const yPos = i * scatterSize;

        svg.append("line")
            .attr("x1", xPos)
            .attr("y1", 0)
            .attr("x2", xPos)
            .attr("y2", scatterSize * columns.length)
            .style("stroke", gridStroke);

        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yPos)
            .attr("x2", scatterSize * columns.length)
            .attr("y2", yPos)
            .style("stroke", gridStroke);
    }

    columns.forEach((xColumn, i) => {
        columns.forEach((yColumn, j) => {
            const xPos = i * scatterSize;
            const yPos = j * scatterSize;

            if (i !== j) {
                const plotSize = scatterSize - 2 * padding;

                const xExtent = d3.extent(data.scatter_data, d => d[xColumn]);
                const yExtent = d3.extent(data.scatter_data, d => d[yColumn]);

                const xScale = d3.scaleLinear()
                    .domain(xExtent)
                    .nice()
                    .range([0, plotSize]);

                const yScale = d3.scaleLinear()
                    .domain(yExtent)
                    .nice()
                    .range([plotSize, 0]);

                const g = svg.append("g")
                    .attr("transform", `translate(${xPos + padding},${yPos + padding})`);

                g.selectAll("circle")
                    .data(data.scatter_data)
                    .enter().append("circle")
                    .attr("cx", d => xScale(d[xColumn]))
                    .attr("cy", d => yScale(d[yColumn]))
                    .attr("r", 3)
                    .style("fill", (d, index) => colorOpts(data.cluster_labels[`('${xColumn}', '${yColumn}')` ][index]));  

                if (j === columns.length - 1) {
                    g.append("g")
                        .attr("transform", `translate(0,${plotSize + 2 * padding})`)
                        .call(d3.axisBottom(xScale).ticks(5))
                        .selectAll("text");
                }

                if (i === 0) {
                    g.append("g")
                        .attr("transform", `translate(${-2 * padding}, 0)`)
                        .call(d3.axisLeft(yScale).ticks(5));
                }

                if (j === 0) {
                    g.append("g")
                        .attr("transform", `translate(0, ${-2 * padding})`)
                        .call(d3.axisTop(xScale).ticks(5))
                        .selectAll("text");
                }

                if (i === columns.length - 1) {
                    g.append("g")
                        .attr("transform", `translate(${plotSize + 2 * padding}, 0)`)
                        .call(d3.axisRight(yScale).ticks(5));
                }
            } else {
                svg.append("text")
                    .attr('class', 'axis-label')
                    .attr("x", xPos + scatterSize / 2)
                    .attr("y", yPos + scatterSize / 2)
                    .attr("text-anchor", "middle")
                    .text(xColumn)
                    .attr("dy", "0.35em"); 
            }
        });
    });
}


/* ******************************************************************************  */