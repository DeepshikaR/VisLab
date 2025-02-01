/* 
    Define functions to plot graphs
    1. Bar Chart - Vertical
    2. Bar Chart - Horizontal
    3. Histogram - Vertical
    4. Histogram - Horizontal
    5. Scatter Plot
*/

// Declare required variables
let X, Y, plotVar;
// Attribute List
const attrs = ["Artist", "Duration (ms)", "Explicit Content", "Year", "Popularity", "Danceability", "Energy", "Key", "Loudness (dB)", "Mode",
    "Speechiness", "Acousticness", "Instrumentalness", "Liveness", "Valence", "Tempo (BPM)", "Genre"];
const numerical = [2, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16];
const categorical = [1, 3, 4, 8, 10, 17];

let columns = [];

// Extract Data from CSV file
d3.csv("https://raw.githubusercontent.com/DeepshikaR/VisLab/main/songs.csv", function (data) {

    columns = [
        data.map(d => d.artist),
        data.map(d => +d.duration_ms),
        data.map(d => d.explicit),
        data.map(d => d.year),
        data.map(d => +d.popularity),
        data.map(d => +d.danceability),
        data.map(d => +d.energy),
        data.map(d => d.key),
        data.map(d => +d.loudness),
        data.map(d => d.mode),
        data.map(d => +d.speechiness),
        data.map(d => +d.acousticness),
        data.map(d => +d.instrumentalness),
        data.map(d => +d.liveness),
        data.map(d => +d.valence),
        data.map(d => +d.tempo),
        data.map(d => d.genre),
    ];
});



// 1. VERTICAL BAR CHART - Categorical Data
function barSVG(attr) {

    // Define Dimensions 
    const margin = { top: 30, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append to SVG
    const svg = d3.select("#graph-canvas")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Extract selected attribute's data
    const labels = columns[attr - 1];

    // Count occurrences of each label
    const labelCounts = {};
    labels.forEach(s => {
        labelCounts[s] = (labelCounts[s] || 0) + 1;
    });

    // Convert to an array of objects
    const labelData = Object.keys(labelCounts).map(A => ({ A, count: labelCounts[A] }));

    // select labels with occurences over 11
    let minCount = 11;
    const filteredData = labelData.filter(d => d.count > minCount);

    // Define scales and axes
    const x = d3.scaleBand()
        .domain(filteredData.map(d => d.A))
        .range([0, width]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.count)])
        .nice()
        .range([height, 0]);
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Append axes to SVG
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Draw bar chart
    svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.A))
        .attr("width", x.bandwidth() - 1)
        .attr("y", d => y(0))
        .attr("height", d => height - y(0));

    // Add slide-in transition for bars
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
        .delay((d, i) => (i * 100))

    // Display count of label on hover over bar
    svg.selectAll("rect")
        .on("mouseover", function (d) {
            d3.select(this).attr("fill", "steelblue");
            svg.select(".count-textbox")
                .attr("x", x(d.A) + (x.bandwidth() / 2))
                .attr("y", y(d.count) - 5)
                .text(d.count)
                .style("visibility", "visible");
        })
        .on("mouseout", function (event, d) {
            // Hide count when not hovered
            d3.select(this).attr("fill", "black");
            svg.select(".count-textbox").style("visibility", "hidden");
        });

    // Append div that displays count to SVG; initially hidden
    svg.append("text")
        .attr("class", "count-textbox")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 80)
        .attr("text-anchor", "middle")
        .text(attrs[attr - 1]);

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("No. of Songs");

    // Add Chart Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + height + 85)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("No. of Songs Vs. " + attrs[attr - 1]);

}

// 2. HORIZONTAL BAR CHART - Categorical Data
function barHorSVG(attr) {

    const margin = { top: 30, right: 20, bottom: 30, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#graph-canvas")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    const labels = columns[attr - 1];

    const labelCounts = {};
    labels.forEach(s => {
        labelCounts[s] = (labelCounts[s] || 0) + 1;
    });

    const labelData = Object.keys(labelCounts).map(A => ({ A, count: labelCounts[A] }));
    let minCount = 11;
    const filteredData = labelData.filter(d => d.count > minCount);

    // Define Axes and Append to SVG
    const x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d.count)])
        .nice()
        .range([0, width]);
    const y = d3.scaleBand()
        .domain(filteredData.map(d => d.A))
        .range([0, height])
        .padding(0.1);
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // Draw bars
    svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(0))
        .attr("height", y.bandwidth())
        .attr("y", d => y(d.A))
        .attr("width", d => x(0));

    // Add slide-in transition for bars
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("width", d => x(d.count))
        .delay((d, i) => (i * 100))

    // Display count of label on hover over bar
    svg.selectAll("rect")
        .on("mouseover", function (d) {
            console.log(x(d.count));
            d3.select(this).attr("fill", "steelblue");
            svg.select(".count-textbox")
                .attr("y", y(d.A) + (y.bandwidth() / 2))
                .attr("x", x(d.count) + 20)
                .attr("dy", "0.35em")
                .text(d.count)
                .style("visibility", "visible");
        })
        .on("mouseout", function (event, d) {
            d3.select(this).attr("fill", "black");
            svg.select(".count-textbox").style("visibility", "hidden");
        });

    svg.append("text")
        .attr("class", "count-textbox")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .attr("text-anchor", "middle")
        .text("No. of Songs");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text(attrs[attr - 1]);

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + height + 85)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("No. of Songs Vs. " + attrs[attr - 1]);

}


// 3. VERTICAL HISTOGRAM - Numerical Data
function histSVG(attr) {

    // Extract values of chosen attribute
    const values = columns[attr - 1];

    // Create histogram generator
    const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(values))
        .thresholds(10);

    // Bin the data into intervals
    const bins = histogram(values);

    // Define dimensions
    const margin = { top: 30, right: 20, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append SVG to the content div
    const svg = d3.select("#graph-canvas")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales for the x-axis and y-axis
    const x = d3.scaleLinear()
        .domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)])
        .nice()
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Draw histogram
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("width", d => x(d.x1) - x(d.x0) - 1)
        .attr("y", d => y(0))
        .attr("height", d => y(0) - y(0))
        .attr("fill", "black")
        .on("mouseover", function (d) {
            // Display count on hover
            d3.select(this).attr("fill", "steelblue");
            svg.select(".count-textbox")
                .attr("x", x((d.x0 + d.x1) / 2))
                .attr("y", y(d.length) - 5)
                .text(d.length)
                .style("visibility", "visible");
        })
        .on("mouseout", function (event, d) {
            // Hide count when not hovered
            d3.select(this).attr("fill", "black");
            svg.select(".count-textbox").style("visibility", "hidden");
        });

    // Add slide-in transition for bars
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length))
        .delay((d, i) => (i * 100));

    svg.append("text")
        .attr("class", "count-textbox")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 5)
        .attr("text-anchor", "middle")
        .text(attrs[attr - 1]);
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 1)
        .attr("dy", "0.71em")
        .attr("text-anchor", "middle")
        .text("No. of Songs");
    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("No. of Songs Vs. " + attrs[attr - 1]);

}

// 4. HORIZONTAL HISTOGRAM - Numerical Data
function histHorSVG(attr) {

    // Extract values for chosen attribute
    const values = columns[attr - 1];

    // Histogram generator and bin data
    const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(values))
        .thresholds(10);
    const bins = histogram(values);

    const margin = { top: 30, right: 20, bottom: 30, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#graph-canvas")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define X-axis and Y-axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([d3.min(bins, d => d.x0), d3.max(bins, d => d.x1)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Draw Histogram
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(0))
        .attr("width", d => x(d.length) - x(d.length))
        .attr("y", d => y(d.x1))
        .attr("height", d => y(d.x0) - y(d.x1) - 1)
        .attr("fill", "black")
        .on("mouseover", function (d) {
            // Display count on hover
            d3.select(this).attr("fill", "steelblue");
            svg.select(".count-textbox")
                .attr("y", y((d.x0 + d.x1) / 2) + 3)
                .attr("x", x(d.length) + 15)
                .text(d.length)
                .style("visibility", "visible");
        })
        .on("mouseout", function (event, d) {
            // Hide count when not hovered
            d3.select(this).attr("fill", "black");
            svg.select(".count-textbox").style("visibility", "hidden");
        });

    // Add slide-in transition for bars
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("width", d => x(d.length) - x(0))
        .delay((d, i) => (i * 100));

    svg.append("text")
        .attr("class", "count-textbox")
        .attr("text-anchor", "middle")
        .style("visibility", "hidden");

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 5)
        .attr("text-anchor", "middle")
        .text("No. of Songs");
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 1)
        .attr("text-anchor", "middle")
        .text(attrs[attr - 1]);
    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("No. of Songs Vs. " + attrs[attr - 1]);

}


// 5. SCATTER PLOT
function scatterSVG(attrx, attry) {

    // Extract data from CSV file
    d3.csv("https://raw.githubusercontent.com/DeepshikaR/VisLab/main/songs.csv", function (data) {

        columns = [
            data.map(d => d.artist),
            data.map(d => +d.duration_ms),
            data.map(d => d.explicit),
            data.map(d => d.year),
            data.map(d => +d.popularity),
            data.map(d => +d.danceability),
            data.map(d => +d.energy),
            data.map(d => d.key),
            data.map(d => +d.loudness),
            data.map(d => d.mode),
            data.map(d => +d.speechiness),
            data.map(d => +d.acousticness),
            data.map(d => +d.instrumentalness),
            data.map(d => +d.liveness),
            data.map(d => +d.valence),
            data.map(d => +d.tempo),
            data.map(d => d.genre),
        ];

        // Define dimensions
        const margin = { top: 30, right: 20, bottom: 30, left: 100 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Extract data for x-axis and y-axis as chosen
        const xAttr = columns[attrx - 1];   // x-axis data
        const yAttr = columns[attry - 1];   // y-axis data

        // Create map of extracted data
        const selectedData = data.map((d, i) => ({ xAttr: xAttr[i], yAttr: yAttr[i] }));

        const svg = d3.select("#graph-canvas")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g");

        // CASE 1: BOTH NUMERICAL
        if (numerical.includes(attrx) && numerical.includes(attry)) {

            // Define x and y axes
            const x = d3.scaleLinear()
                .domain([d3.min(xAttr) - 0.5, d3.max(xAttr) + 0.5])
                .nice()
                .range([margin.left, width - margin.right]);
            const y = d3.scaleLinear()
                .domain([d3.min(yAttr) - 0.5, d3.max(yAttr) + 0.5])
                .nice()
                .range([height - margin.bottom, margin.top]);
            // Add x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));
            // Add y-axis
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            // Draw points of scatter plot
            svg.append('g')
                .selectAll("dot")
                .data(selectedData)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.xAttr))
                .attr("cy", d => y(d.yAttr))
                .attr("r", 1.5)
                .style("fill", "steelblue");

        }

        // CASE 2: X - NUMERICAL, Y - CATEGORICAL
        else if (numerical.includes(attrx)) {

            // Count occurrences of Y-attribute labels
            const labelCounts = {};
            yAttr.forEach(s => {
                labelCounts[s] = (labelCounts[s] || 0) + 1;
            });

            // Map of label and occurrences
            const labelData = Object.keys(labelCounts).map(A => ({ A, count: labelCounts[A] }));
            // Choose only labels with over 11 occurrences to plot
            let minCount = 11;
            const filteredData = labelData.filter(d => d.count > minCount);
            const filteredLabels = filteredData.map(d => d.A);
            const filteredyAttr = yAttr.filter(label => filteredLabels.includes(label));

            // Define x-axis
            const x = d3.scaleLinear()
                .domain([d3.min(xAttr), d3.max(xAttr)])
                .nice()
                .range([margin.left, width - margin.right]);
            // Add x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x));

            // Sort labels in alphabetical order
            filteredyAttr.sort((a, b) => +a - +b);
            // Define and add y-axis
            const y = d3.scaleBand()
                .domain(filteredyAttr)
                .range([height - margin.bottom, margin.top]);
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end");

            // Draw points of scatter plot
            svg.append('g')
                .selectAll("dot")
                .data(selectedData.filter(d => filteredyAttr.includes(d.yAttr)))
                .enter()
                .append("circle")
                .attr("cx", d => x(d.xAttr))
                .attr("cy", d => y(d.yAttr) + y.bandwidth() / 2)
                .attr("r", 2)
                .style("fill", "steelblue");
        }

        // CASE 3: X - CATEGORICAL, Y - NUMERICAL
        else if (numerical.includes(attry)) {

            // Count occurrences of x-attribute labels
            const labelCounts = {};
            xAttr.forEach(s => {
                labelCounts[s] = (labelCounts[s] || 0) + 1;
            });
            // Map label and occurrences
            const labelData = Object.keys(labelCounts).map(A => ({ A, count: labelCounts[A] }));
            // Choose labels with over 11 occurrences to plot
            let minCount = 11;
            const filteredData = labelData.filter(d => d.count > minCount);
            const filteredLabels = filteredData.map(d => d.A);
            const filteredxAttr = xAttr.filter(label => filteredLabels.includes(label));

            // Sort labels in alphabetical order
            filteredxAttr.sort((a, b) => +a - +b);
            // Define x-axis
            const x = d3.scaleBand()
                .domain(filteredxAttr)
                .range([margin.left, width - margin.right]);
            // Add x-axis
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            // Define and add y-axis
            const y = d3.scaleLinear()
                .domain([d3.min(yAttr), d3.max(yAttr)])
                .nice()
                .range([height - margin.bottom, margin.top]);
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            // Draw points of scatter plot
            svg.append('g')
                .selectAll("dot")
                .data(selectedData.filter(d => filteredxAttr.includes(d.xAttr)))
                .enter()
                .append("circle")
                .attr("cx", d => x(d.xAttr) + x.bandwidth() / 2)
                .attr("cy", d => y(d.yAttr))
                .attr("r", 2)
                .style("fill", "steelblue");

        }

        // CASE 4: BOTH CATEGORICAL 
        else {

            // Sort labels in alphabetical order
            xAttr.sort((a, b) => +a - +b);
            yAttr.sort((a, b) => +a - +b);

            // Define and add axes
            const x = d3.scaleBand()
                .domain(xAttr)
                .range([margin.left, width - margin.right]);
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");
            const y = d3.scaleBand()
                .domain(yAttr)
                .range([height - margin.bottom, margin.top]);
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end");

            // Draw points of scatter plot
            svg.append('g')
                .selectAll("dot")
                .data(xAttr)
                .enter()
                .append("circle")
                .attr("cx", (d, i) => x(xAttr[i]) + x.bandwidth() / 2)
                .attr("cy", (d, i) => y(yAttr[i]) + y.bandwidth() / 2)
                .attr("r", 3)
                .style("fill", "steelblue");

        }

        // FOR ALL CASES

        // Add x-axis label
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .text(attrs[attrx - 1]);

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 1)
            .attr("dy", "0.71em")
            .attr("text-anchor", "middle")
            .text(attrs[attry - 1]);

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.bottom - 15)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text(attrs[attrx - 1] + " Vs. " + attrs[attry - 1]);
    });
}