/*****************************************************************************/
// This is the visualization that depicts the total number of students, total//
// number of faculty, and the student-to-faculty ratio in a selectable line  //
// graph. This is under the "Growth of Computer Science" section.            //
/*****************************************************************************/

// SVG drawing area
var margin_line = {top: 20, right: 20, bottom: 40, left: 60};
var width_line = 700 - margin_line.left - margin_line.right,
        height_line = 450 - margin_line.top - margin_line.bottom;
var svg = d3.select("#chart-area_line").append("svg")
        .attr("width", width_line + margin_line.left + margin_line.right)
        .attr("height", height_line + margin_line.top + margin_line.bottom)
    .append("g")
        .attr("transform", "translate(" + margin_line.left + "," + margin_line.top + ")");


// Initialize data
loadData();

var data_line;



// Scales
var xScale_line = d3.time.scale()
    .range([0, width_line]);
var yScale_line = d3.scale.linear()
    .range([height_line, 0]);

// Axes
var xAxis_line = d3.svg.axis()
    .scale(xScale_line)
    .orient("bottom")
    .ticks(5);
var x_group = svg.append("g")
    .attr("class", "axis x-axis growth-axis")
    .attr("transform", "translate(0,"+(height_line)+")");

var yAxis_line = d3.svg.axis()
    .scale(yScale_line)
    .orient("left")
    .ticks(8);
var y_group = svg.append("g")
    .attr("class", "axis y-axis growth-axis")
    .attr("transform", "translate(0,0)");
//.call(yAxis);

var y_title = y_group.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dy", "1.5em")
    .style("text-anchor", "end");

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");

// Load CSV file
function loadData() {
    d3.csv("data/RatioNewData.csv", function(error, csv) {

        csv.forEach(function(d){
            // Convert string to 'date object'
            d.Year = formatDate.parse(d.Year);
            
            // Convert numeric values to 'numbers'
            d.Students = +d.Students;
            d.Faculty = +d.Faculty;
            d.Ratio = +d.Ratio;
        });

        // Store csv data in global variable
        data_line = csv;

        // Draw the visualization for the first time
        updateVisualization();
    });
}

var chartValue;
d3.select("#data-choice").on("change", function(){
    console.log("New selection.");
    updateVisualization();});

var transitionDuration = 800;



//-----------------------------------------------------------------------------
// Initializing Line chart
//-----------------------------------------------------------------------------

// Initialize data
chartValue = d3.select("#data-choice").property("value");
var line_line = d3.svg.line().interpolate("monotone")
    .x(function (d) {return xScale_line(d.Year);})
    .y(function (d) {return yScale_line(d[chartValue]);});

// Draw initial line
svg.selectAll('.line-path').data([data_line]).enter().append('path').attr("class", "line path");



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// UPDATE FUNCTION
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

// Render visualization
function updateVisualization() {
    
    console.log(data_line);
    //-----------------------------------------------------------------------------
    // Initialize
    //-----------------------------------------------------------------------------

    var formatDate = d3.time.format("%Y");

    // Domains
    chartValue = d3.select("#data-choice").property("value");
    //console.log(d3.select("#data-choice").property("text"));
    //xScale.domain(d3.extent(data, function(d){return d.YEAR}));
    xScale_line.domain(d3.extent(data_line, function(d){return d.Year;}));
    yScale_line.domain([0, d3.max(data_line, function(d){return d[chartValue]})]);

    //-----------------------------------------------------------------------------
    // Line chart
    //-----------------------------------------------------------------------------

    // Initialize data
    var line_line = d3.svg.line()
        .x(function (d) {return xScale_line(d.Year);})
        .y(function (d) {return yScale_line(d[chartValue]);});

    // Initialize
    //path = svg.selectAll('path');

    // Update
    //path.transition().duration(transitionDuration).attr("class", "line path").attr('d', line(data));
    svg.selectAll('path').transition().style("stroke-width", "0px").transition().duration(200).delay(500).attr("class", "line path").style("stroke-width", "2.5px").attr('d', line_line(data_line));


    //-----------------------------------------------------------------------------
    // Circles
    //-----------------------------------------------------------------------------

    var sel = document.getElementById('data-choice');
    y_text = sel.options[sel.selectedIndex].text;
    var formatDate;

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-15, 0])
        .html(function(f) {
            if (chartValue == "Faculty") {
                return "<emph>"
                +y_text+":</emph> <span style='color:white'>" + 
                d3.format(",")(f[chartValue]) + "</span>" + "<br>"
                + "Total Minority: " + f.FMinority + "<br>" + "Total Women: " + f.FWomen
            } else if (chartValue == "Students") {
                return "<emph>"
                +y_text+":</emph> <span style='color:white'>" + 
                d3.format(",")(f[chartValue]) + "</span>" + "<br>"
                + "Total Minority: " + f.SMinority + "<br>" + "Total Women: " + f.SWomen
            } else {
                return "<emph>"
                +y_text+":</emph> <span style='color:white'>" + 
                d3.format(",")(f[chartValue]) + "</span>"
            }
        });



    // Key function / data-join
    var circles = svg.selectAll("circle")
        .data(data_line, function(d, index){return d.Year});

    circles.enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", "#707086")
        .attr("cx", function(d) { return xScale_line(d.Year); })
        .attr("r", 10)
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // Update
    circles
        .style("opacity", 0.9)
        .transition()
        .duration(transitionDuration)
        .attr("cx", function(d) { return xScale_line(d.Year); })
        .attr("cy", function(d) {return yScale_line(d[chartValue])})
        .style("opacity", 0.9)
        .transition()
        .duration(transitionDuration)
        .call(tip);

    // Enter



    // Exit
    circles.exit().remove();


    //-----------------------------------------------------------------------------
    // Axis update
    //-----------------------------------------------------------------------------

    // Axis
    x_group
        .transition()
        .duration(transitionDuration)
        .call(xAxis_line)
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", 0);
    y_group
        .transition()
        .duration(transitionDuration)
        .call(yAxis_line);

    // Text for y_title
    y_title
        .transition()
        .duration(transitionDuration)
        .text(y_text);



}


