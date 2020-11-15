// The following code is based on Ritchie S. King's interactive resume http://ritchiesking.com/resume/
// Modifications made by Alex Abrahams in July 2018

/* 
Modifications:
- Margin numbers
- Deleted the part where we add an extra SVG for the detail, and now we just update the IDs in the HTML using showDetail function
Note: this may make this harder for others to customize; HTML and the data have to be perfecly in sync re: ID and column names
i.e. if you add data columns or change the column names
- Now we create the y axis category labels and the rectangle labels programmatically rather than repeating code for adding text
- We now find the years for vertical year lines programmatically so that viz stays up to date
- There are no longer mini-categories
*/

// divWidth and divHeight are used to keep the visualization within the boundaries
// of its parent div
var timeline = $("#timeline")
    divWidth = timeline.width()
    divHeight = timeline.height()

var detail = $("#detail");
    detailWidth = detail.width()
    detailHeight = detail.height()

// The index in the data of the default selected option for detail div
// Declared here, and when data is loaded the item with last date gets the default div
// May be a problem if you have multiple items with latest date; would have to then manually pick one
var selected;

// Decide margin boundaries and width and height
var margin = {top: 25, right: 50, bottom: 10, left: 80};
    width = divWidth - margin.left - margin.right,
    height = divHeight - margin.top - margin.bottom;

var svg = d3.select("#timeline").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Parser to turn strings of format 1-Jan-99 into date objects
var parseDate = d3.time.format("%d-%b-%y").parse

var x = d3.time.scale()
    .range([0, width]);

d3.csv("./js/timeline_v3.csv", function(error, data){

    // Find the unique categories for the domain for the y axis
    domain_list = []
    data.forEach(function(d) {
        if ($.inArray(d.cat, domain_list) == -1) {
            domain_list.push(d.cat);
        }
    })

    // Code to find the range of y axis values for the categories
    // For the moment, evenly space the categories
    var range_list = [];
    var last = -30;
    for (var i = 1; i <= domain_list.length; i++) {
        var newLevel = last + (height / domain_list.length);
        range_list.push(newLevel);
        last = newLevel;
    };
    var y = d3.scale.ordinal()
        // This domain should be only the unique levels 
        .domain(domain_list)
        .range(range_list);
    
    // Add the category labels on y axis
    svg.selectAll(".categoryLabels")
        .data(domain_list)
      .enter().append("text")
        .attr("class","categoryLabels")
        .text(function(d) { return d; })
        .attr("x", -margin.left)
        .attr("y", function(d, i) { 
            return y(d) +5;
        });

    // Format the dates in the data as date objects
    data.forEach(function(d){
        // Turn the 'present' word into today's date
        if (d.end == 'present') {
            d.end = new Date()
        } else {
            // If not the word 'present', then format as a date
            d.end = parseDate(d.end)
        }
        d.beg = parseDate(d.beg)
    });

    // Find the last date in the data, and pass that row as the default detail to showDetail
    var max_date = d3.max(data, function(d) { return d.end; })
    data.forEach(function(d,i){
        if (d.end == max_date) {
            showDetail(d);
            // Also set the selected index for black color in rectangle
            selected = i;
        }
    });

    // Find earliest and latest date to set the axis tickpoints
    var minYear = d3.min(data, function(d) { 
        return d.beg.getFullYear(); 
    });

    // Today's year (to keep the graph up to date)
    var presentYear = (new Date()).getFullYear();
    // Create array of the axis points from the minimum year in the data to the present year
    var axisPoints = [];
    for (var i = minYear; i <= presentYear; i++) {
        // date object for 2012 Jan 1st
        var new_date = new Date(i, 0, 1);
        axisPoints.push({year:i.toString(), date:new_date});
    }

    // Update the x scale with the domain from the dataset
    x.domain([
        d3.min(data, function(d) { return d.beg; }),
        d3.max(data, function(d) { return d.end; })
    ])

    // Create the vertical lines for each year
    svg.selectAll(".axis")
        .data(axisPoints)
      .enter().append("line")
        .attr("x1", function(d) { return x((d.date)); })
        .attr("x2", function(d) { return x((d.date)); })
        .attr("y1", -10)
        .attr("y2", height+10)
        .attr("stroke", "#E6E6E6")
        .attr("stroke-width", 1)
    // Create the year labels above each vertical line
    svg.selectAll(".axisLabels")
        .data(axisPoints)
      .enter().append("text")
        .attr("class","axisLabels")
        .attr("x", function(d) { return x((d.date)); })
        .attr("y", function(d, i) { return -15; })
        .attr("text-anchor","middle")
        .text(function(d) { return d.year; })

    // Add text for the rectangles
    svg.selectAll(".rectLabels")
        .data(data)
      .enter().append("text")
        .attr("class","rectLabels")
        .text(function(d) { return d["label"]; })
        .attr("x", function(d) { return x(d.beg); })
        .attr("y", function(d, i) { 
            // certain items are too close together, so have to put their labels underneath the rect
            if (d["label"] == "parliament") {
                return y(d.cat) + 30; 
            } else {
                return y(d.cat) - 4; 
            }
        });

    // Add the rectangles
    var lines = svg.selectAll(".rect")
        .data(data)
      .enter().append("rect")
        .attr("class","rect")
        .attr("x", function(d) { return x(d.beg); })
        .attr("width", function(d) { return x(d.end)-x(d.beg); })
        .attr("y", function(d) { return y(d.cat); })
        .attr("height", 15)
        .on("click", function(d, i) {
            selected = i;
            updateColor();
            showDetail(d);
        })
        .attr("fill", function(d, i) {
            if (i==selected) {
                return "#000000"
            }
            else {
                return "#B3B3B3"
            }
        })
        .attr("stroke", "white");

    // Function to update the color of the line; called when a line is clicked
    var updateColor = function() {
        lines.transition()
            .duration(400)
            .attr("fill",function(d,i){
                if (i === selected){
                    return "#000000"
                }
                else{
                    return "#B3B3B3"
                }
            });
        }

})

// Show details for a specific job
function showDetail(d){
    console.log(d);
    d3.select("#job").text(d.job);
    d3.select("#job_title").text(d.job_title);
    d3.select("#job_date").text(d.job_date);
    d3.select("#job_description").text(d.job_description);
}