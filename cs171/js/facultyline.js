/*****************************************************************************/
// This is the visualization that portrays the total number of faculty as    //
// well as the number of minorities and females, in the form of a line graph.//
// This visualization is under the "Accessing the Department" section.       //
/*****************************************************************************/

var margin = {top: 100, right: 80, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDatef = d3.time.format("%Y").parse;

var xf = d3.time.scale()
    .range([0, width]);

var yf = d3.scale.linear()
    .range([height, 0]);

var colorf = d3.scale.ordinal()
    //.range(["#A6D8DE", "#F9F1B5", "#7B9DA6"]);
    .range(["#F9F1B5", "95c2c7", "7B9DA6"]);

var xAxisf = d3.svg.axis()
    .scale(xf)
    .orient("bottom");

var yAxisf = d3.svg.axis()
    .scale(yf)
    .orient("left");

var linef = d3.svg.line()
    .interpolate("linear")
    .x(function(d) { return xf(d.date); })
    .y(function(d) { return yf(d.number); });

var svg_line_graphf = d3.select("#line2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/faculty.csv", function(error, data) {
  if (error) throw error;

  colorf.domain(d3.keys(data[0]).filter(function(keyf) { return keyf !== "AcademicYear"; }));

  data.forEach(function(d) {
    d["AcademicYear"] = parseDatef(d["AcademicYear"]);
  });

  var citiesf = colorf.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d["AcademicYear"], number: +d[name]};
      })
    };
  });

  console.log(citiesf);

  // console.log("Cities: ");
  // console.log(cities);

  xf.domain(d3.extent(data, function(d) { return d["AcademicYear"]; }));

  yf.domain([
    d3.min(citiesf, function(c) { 
      return d3.min(c.values, function(v) { 
        return v.number; 
      }); 
    }),
    d3.max(citiesf, function(c) { return d3.max(c.values, function(v) { return v.number; }); })
  ]);

  svg_line_graphf.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisf);

  svg_line_graphf.append("g")
      .attr("class", "y axis")
      .call(yAxisf)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Numbers");


  var cityf = svg_line_graphf.selectAll(".cityf")
      .data(citiesf)
    .enter().append("g")
      .attr("class", "cityf");

  cityf.append("path")
      .attr("class", "linef")
      .attr("d", function(d) {
        console.log(d.values);
        return linef(d.values); 
      })
      .style("stroke", function(d) { return colorf(d.name); });
      
  cityf.append("text")
       .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
       .attr("transform", function(d) { return "translate(" + xf(d.value.date) + "," + yf(d.value.number) + ")"; })
       .attr("x", 3)
       .attr("dy", ".35em")
       .text(function(d) { return d.name; });

 });