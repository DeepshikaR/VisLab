/* ******************************************************************************  */

// Import Functions to help update Graphs
import { findElbowPoint, updateBiPlot, updateScatterMatrix, updateTopFourAttr, updateMdsScatter, updatePCP } from "./helperFns.js";


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
    const colors = ["#800020", "#6A5ACD", "#008080", "#E2725B", "#608000", "#FFDB58", "#FF0080", "black", "blue", "red"];
    return colors[label];
}


/* ******************************************************************************  */


// Scree Plot of EigenValues from PCA
export function screePlot(data) {

    d3.select("#pca-chart").selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 50, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    if (screeIndex === -1) {
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
        .attr("x", (d, i) => x(i + 1) + (barSpacing / 2))
        .attr("width", barWidth)
        .attr("y", d => y(d))
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => i === screeIndex - 1 ? "#6A5ACD" : '#008060')
        .attr("barNo", (d, i) => i + 1) // Attribute for di
        .on("mouseover", function () {
            d3.select(this).attr("fill", "#FFDB58");
        })
        .on("mouseout", function () {
            const index = +d3.select(this).attr("barNo");
            d3.select(this).attr("fill", index === screeIndex ? "#6A5ACD" : "#008060");
        })
        .on("click", function () {
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
        .attr("cx", (d, i) => x(i + 1) + x.bandwidth() / 2)
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
        .x((d, i) => x(i + 1) + x.bandwidth() / 2)
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
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top / 2})`)
        .style("text-anchor", "middle")
        .text("Principal Component");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Variance Explained (%)");

    svg.append("text")
        .attr('class', 'legend')
        .attr("x", width - 120)
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

    if (mseIndex === -1) {
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
        .attr("x", (d, i) => x(i + 1) + (barSpacing / 2))
        .attr("width", barWidth)
        .attr("y", d => y(d))
        .attr("height", d => height - y(d))
        .attr("fill", (d, i) => i === mseIndex - 1 ? "#6A5ACD" : '#008060')
        .attr("barNo", (d, i) => i + 1) // Attribute for K (clusters)
        .on("mouseover", function () {
            d3.select(this).attr("fill", "#FFDB58");
        })
        .on("mouseout", function () {
            const index = +d3.select(this).attr("barNo");

            d3.select(this).attr("fill", index === mseIndex ? "#6A5ACD" : '#008060');
        })
        .on("click", function () {
            mseIndex = +d3.select(this).attr("barNo");
            const mseKForm = {
                k: mseIndex,
            };
            sendData('/set_k', mseKForm);
            updateBiPlot()
            updatePCP()
            updateMdsScatter()
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
        .attr("cx", (d, i) => x(i + 1) + x.bandwidth() / 2)
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
        .x((d, i) => x(i + 1) + x.bandwidth() / 2)
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
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top / 2})`)
        .style("text-anchor", "middle")
        .text("Number of Clusters (k)");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Mean Squared Error (MSE)");

    svg.append("text")
        .attr('class', 'legend')
        .attr("x", width - 120)
        .attr("y", margin.top + 30)
        .style("text-anchor", "middle")
        .text("No. of Clusters, k = " + mseIndex);

}


/* ******************************************************************************  */

// PCA-Based Biplot
export function biplot(data) {
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
            .attr("x1", width / 2)
            .attr("y1", height / 2)
            .attr("x2", x(component[0]))
            .attr("y2", y(component[1]))
            .attr("marker-end", "url(#arrowhead-" + i + ")")
            .style("stroke", color)
            .style("stroke-width", 2);

        svg.append("text")
            .attr("x", width - 120)
            .attr("y", height - height / 3 + margin.top + 20 * i)
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
    });

    svg.append("text")
        .attr("x", width)
        .attr("y", height / 2 - 10)
        .attr("text-anchor", "end")
        .text("PC1");

    svg.append("text")
        .attr("x", width / 2 + 20)
        .attr("y", height)
        .attr("text-anchor", "middle")
        .text("PC2");

    svg.append("text")
        .attr("x", width - 200)
        .attr("y", margin.top + 20)
        .text("PC1 - Principal Component 1");

    svg.append("text")
        .attr("x", width - 200)
        .attr("y", margin.top + 40)
        .text("PC2 - Principal Component 2");

    svg.append("g")
        .attr("transform", `translate(0,${height / 2})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${width / 2}, 0)`)
        .call(d3.axisLeft(y));

}


/* ******************************************************************************  */

// MDS-Data Scatterplot
export function mdsScatter(Data) {
    d3.select("#mds-scatter-data").selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const xRange = d3.extent(Data.X_mds, d => d[0]);
    const yRange = d3.extent(Data.X_mds, d => d[1]);
    const maxExtent = Math.max(Math.abs(xRange[0]), Math.abs(xRange[1]), Math.abs(yRange[0]), Math.abs(yRange[1]));

    const x = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([height, 0]);

    const svg = d3.select("#mds-scatter-data")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.selectAll(".point")
        .data(Data.X_mds)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("r", 3)
        .attr("fill", (d, i) => colorOpts(Data.cluster_labels[i]));
   
    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top / 2})`)
        .style("text-anchor", "middle")
        .text("MDS Component 1");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 2 - 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("MDS Component 2");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisTop(x));

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(y));

}


/* ******************************************************************************  */


// MDS-Variables Scatterplot
export function mdsScatterVar(Data) {
    d3.select("#mds-scatter-var").selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const xRange = d3.extent(Data.var_mds, d => d[0]);
    const yRange = d3.extent(Data.var_mds, d => d[1]);
    const maxExtent = Math.max(Math.abs(xRange[0]), Math.abs(xRange[1]), Math.abs(yRange[0]), Math.abs(yRange[1]));

    const x = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([-maxExtent, maxExtent])
        .nice()
        .range([height, 0]);

    const svg = d3.select("#mds-scatter-var")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const squareColors = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll(".point")
        .data(Data.var_mds)
        .enter().append("rect")
        .attr("class", "point")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", d => x(d[0]) - 5)
        .attr("y", d => y(d[1]) - 5)
        .attr("fill", (d, i) => squareColors(i))
        .attr("opacity", 0.7)
        .attr("varNo", (d, i) => i + 1)
        .on("mouseover", function (d,i) {
            d3.select(this).attr("width", 25).attr("height", 25);
            const var_no = +d3.select(this).attr("varNo");
            const xVal = (Data.var_mds[var_no-1][0]).toFixed(2);
            const yVal = (Data.var_mds[var_no-1][1]).toFixed(2);
            svg.select(".count-textbox")
                .attr("x", margin.left)
                .attr("y", margin.top)
                .text(`(${xVal}, ${yVal})`)
                .style("visibility", "visible");
        })
        .on("mouseout", function () {
            d3.select(this).attr("width", 10).attr("height", 10);
            svg.select(".count-textbox").style("visibility", "hidden");
        })
        .on("click", function () {
            const var_no = +d3.select(this).attr("varNo");
            console.log(var_no);
            const mdsForm = {
                v: var_no,
            };
            sendData('/set_vars', mdsForm);
            updatePCP()
        });

    svg.append("text")
        .attr("class", "count-textbox")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");


    Data.var_mds.forEach((d, i) => {
        const color = squareColors(i);

        svg.append("text")
            .attr("x", width - 140)
            .attr("y",  margin.top + 20 * i)
            .style("fill", color)
            .append("tspan")
            .text(Data.feature_names[i]);

    });


    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", `translate(${width / 2},${height + margin.bottom - margin.top / 2})`)
        .style("text-anchor", "middle")
        .text("MDS Component 1");

    svg.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left / 2 - 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("MDS Component 2");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        // .attr("transform", `translate(${width / 2}, 0)`)
        .call(d3.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisTop(x));

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(y));

    

}


/* ******************************************************************************  */


// Scatter Plot Matrix
export function scatterPlot(data) {
    d3.select("#scatter-plot").selectAll("*").remove();

    const margin = { top: 50, right: 20, bottom: 50, left: 100 };
    const width = 850 - margin.left - margin.right;
    const height = 850 - margin.top - margin.bottom;

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
                    .style("fill", (d, index) => colorOpts(data.cluster_labels[`('${xColumn}', '${yColumn}')`][index]));

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


/* *****************************************************************************  */


// Parallel Coordinates Plot
export function parallelPlot(data) {

    d3.select("#pcp").selectAll("*").remove();

    const margin = { top: 20, right: 50, bottom: 50, left: 30 };
    const width = 600 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#pcp")
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const pcpData = data.X_pcp;
    const features = data.feature_names;

    const shortAttributeNames = new Map(
        Object.entries({
            child_mortality: "CM", exports: "EXP", health_spending: "HS",
            imports: "IMP", income: "INC", inflation: "INF",
            life_expectancy: "LE", total_fertility: "TF", GDP_per_capita: "GDP",
        })
    )

    const x = d3.scalePoint(features, [margin.left, width - margin.right])
    const y = {}

    features.forEach(function (attribute) {

        var ycol = d3.scaleLinear()
            .domain([d3.min(pcpData, d => d[attribute]), d3.max(pcpData, d => d[attribute])])
            .range([height - margin.bottom, margin.top])
            .nice();

        y[attribute] = ycol

    });

    svg.append("style")
        .text("path.hidden { stroke: #000; stroke-opacity: 0.01;}");

    let activeBrushes = new Map();
    var dragging = {};

    function update_position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition_function(g) {
        return g.transition().duration(100);
    }

    const polylines = svg
        .append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.55)
        .selectAll("path")
        .data(pcpData)
        .join("path");

    polylines.attr("class", "data-line")
        .attr("d", d => d3.line()
            .defined(([, value]) => value != null)
            .x(([key]) => x(key))
            .y(([key, value]) => y[key](value))
            (d3.cross(features, [d], (key, d) => [key, d[key]])))
        .attr("stroke", (d, i) => colorOpts(data.cluster_labels[i]))
        .append("title")
        .text(d => d.name);

    const axes = svg
        .append("g")
        .selectAll("g")
        .data(features)
        .join("g")
        .attr("transform", d => `translate(${x(d)},0)`);

    axes.append("g")
        .each(function (d) { d3.select(this).call(d3.axisRight(y[d])); })
        .call(g => g.append("text")
            .attr("class", "axis-text")
            .attr("x", -20)
            .attr("y", height - margin.bottom + 10)
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .text(d => shortAttributeNames.get(d)))
        .call(g => g.selectAll("text")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "black"));

    // Event Listener to Drag Axes by Axes-Label
    axes.selectAll("text.axis-text")
        .call(d3.drag().subject(function (event, d) { return { x: x(d) }; })
            .on("start", function (event, d) {
                dragging[d] = x(d);
            })
            .on("drag", function (event, d) {                
                dragging[d] = Math.min(width - margin.right - margin.left, Math.max(0, event.x));
                features.sort(function (a, b) { return update_position(a) - update_position(b); });
                x.domain(features);
                axes.attr("transform", function (d) { return "translate(" + update_position(d) + ")"; });
                svg.selectAll(".data-line")
                    .attr("d", d => d3.line()
                        .defined(([, value]) => value != null)
                        .x(([key]) => x(key))
                        .y(([key, value]) => y[key](value))
                        (d3.cross(features, [d], (key, d) => [key, d[key]])));
            })
            .on("end", function (event, d) {
                delete dragging[d];
                console.log(features);
                const pcpForm = {
                    orderCols: features,
                };
                sendData('/order_vars_pcp', pcpForm);
                transition_function(d3.select(this.parentNode.parentNode)).attr("transform", "translate(" + x(d) + ")");
                svg.selectAll(".data-line")
                    .attr("d", d => d3.line()
                        .defined(([, value]) => value != null)
                        .x(([key]) => x(key))
                        .y(([key, value]) => y[key](value))
                        (d3.cross(features, [d], (key, d) => [key, d[key]])));
            }));



    function updateBrushing() {
        svg.selectAll("path")
            .classed("hidden", d => {
                var hc = false;
                features.forEach(attribute => {
                    if (activeBrushes.get(attribute) != undefined && d != null) {
                        var y0 = activeBrushes.get(attribute)[0];
                        var y1 = activeBrushes.get(attribute)[1];
                        if (y[attribute](d[attribute]) < y0 || y[attribute](d[attribute]) > y1) {
                            hc = true;
                        }
                    }
                })
                return hc;
            });
    }

    function brushed(event, attribute) {
        activeBrushes.set(attribute, event.selection);
        updateBrushing();
    }

    function brushEnd(event, attribute) {
        if (event.selection === null) {
            activeBrushes.delete(attribute);
            updateBrushing();
        }
    }

    axes.each(function (dimension) {
        const axis = d3.select(this);

        axis.call(d3.brushY()
            .extent([[-10, margin.top], [10, height - margin.bottom]])
            .on("brush", (event) => brushed(event, dimension))
            .on("end", (event) => brushEnd(event, dimension))
        );
    });

}


/* *****************************************************************************  */








