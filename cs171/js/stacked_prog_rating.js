/*****************************************************************************/
// This is our linked visualization of a stacked bar chart portraying the    //
// ratings of confidence between men and women. When clicking a section of   //
// the stacked bar chart, it brings up the pie chart which depics the years  //
// of computer science experience of students in that section.               //
/*****************************************************************************/

// Modified from https://bl.ocks.org/mbostock/3886208

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width_stack = 480 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x_stack = d3.scale.ordinal()
    .rangeRoundBands([0, width_stack], .25);

var y_stack = d3.scale.linear()
    .rangeRound([height, 0]);

var color_stack = d3.scale.ordinal()
    .range(["#633636", "#945951", "#dbc1bd", "#82acc9", "#457aa1", "#2d8cb9"]);

var xAxis_stack = d3.svg.axis()
    .scale(x_stack)
    .orient("bottom");

var yAxis_stack = d3.svg.axis()
    .scale(y_stack)
    .orient("left");
    // .tickFormat(d3.format(".2s"));

var svg_stacked_prog = d3.select("#prog_rating_bar").append("svg")
    .attr("width", width_stack + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tip_stack = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0]);

svg_stacked_prog.call(tip_stack);

d3.csv("data/stacked_prog_rating_percentage2.csv", function(error, data) {
  if (error) throw error;

  color_stack.domain(d3.keys(data[0]).filter(function(key) { return key !== "Rating"; }));

  data.forEach(function(d) {
    var y0 = 0;
    d.ages = color_stack.domain().map(function(name) { return {gender: d.Rating, name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total = d.ages[d.ages.length - 1].y1;
  });

  x_stack.domain(data.map(function(d) { return d.Rating; }));
  y_stack.domain([0, d3.max(data, function(d) { return d.total; })]);

  tip_stack
    .html(function(d) {
        return "Percentage of " + (d.gender).toLowerCase() + " in category " + d.name + ": " + "<br>" + (d.y1 - d.y0) + "%";
    });

  svg_stacked_prog.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height + 80) + ")")
      .call(xAxis_stack);

  svg_stacked_prog.append("g")
      .attr("class", "y axis")
      .call(yAxis_stack)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Percentage in each programming category");

  var state = svg_stacked_prog.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x_stack(d.Rating) + ",0)"; });

  var clicked = false;
  state.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter().append("rect")
      .attr("width",  x_stack.rangeBand())
      .attr("y", function(d) { return y_stack(d.y1); })
      .attr("height", function(d) { return y_stack(d.y0) - y_stack(d.y1); })
      .on('mouseover', tip_stack.show)
      .on('mouseout', tip_stack.hide)
      .on('click', function(d) {
        // clicked = true;
        d3.select("#prog_pie_info")
          .text("Percentage of " + (d.gender).toLowerCase() + " in category " + d.name + ": " + (d.y1 - d.y0) + "%");
        d3.select("#temppie").remove();
        return showPie(d.name, d.gender);
        // clicked = false;
      })
      .transition()
      .duration(1000)
      .style("fill", function(d) { return color_stack(d.name); });

  svg_stacked_prog.call(tip_stack);

  var legend = svg_stacked_prog.selectAll(".legend")
      .data(color_stack.domain().slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width_stack - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color_stack);

  legend.append("text")
      .attr("x", width_stack - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});

function showPie(category, gender) {
  var radius = Math.min(width, height) / 2;

  var data;
  loadData();

  function loadData() {
      d3.csv("data/linked_prog_pie.csv", function(error, csv) {
          if (error) return console.warn(error);
          data = csv;
          
          // Get the filtered csv
          filteredData = data.filter(function (d) {
            return (d["gender"] == gender) && (d["rating"] == category);
          });

          console.log(filteredData);

          // get the count for each "years" of programming
          // var years0, years1, years2, years3, years4, years5, years6,
          // years7, years8, years9, years10, years11;

          var years0, years1, years2, years3, years46, years7;

          years0 = years1 = years2 = years3 = years46 = years7 = 0;

          filteredData.forEach(function (d) {
            if (d.years == "0") {
              years0++;
            } else if (d.years == "1") {
              years1++;
            } else if (d.years == "2") {
              years2++;
            } else if (d.years == "3") {
              years3++;
            } else if (d.years == "4") {
              years46++;
            } else if (d.years == "5") {
              years46++;
            } else if (d.years == "6") {
              years46++;
            } else {
              years7++;
            }
          });

          var total_in_category = (years0 + years1 + years2 + years3 + years46 + years7);

          var numbers = [
              {label: 'Less than a year', value: years0},
              {label: '1 year', value: years1},
              {label: '2 years', value: years2},
              {label: '3 years', value: years3},
              {label: '4 - 6 years', value: years46},
              {label: '7+ years', value: years7}
          ];

          var svg_prog_pie = d3.select("#prog_pie").append("svg")
              .attr("id", "temppie")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + width/2+ "," + height/2 + ")");

          var colorscale = d3.scale.ordinal()
              //.domain(["American Indian or Alaskan Native", "Asian", "Black or African American", "Caucasian", "Hispanic or Latino", "Other"])
              .range(["#422424", "#633636", "#945951", "#ae736b", "#c9a29c", "#dbc1bd", "#c9dbe8", "#82acc9", "#457aa1", "#264459", "#365f7d", "#1e3648"]);

          var tip = d3.tip()
             .attr('class', 'd3-tip')
             .offset([-10, 0]);

          svg_prog_pie.call(tip);

          var arc = d3.svg.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);

          var arcText = d3.svg.arc()
              .outerRadius(radius + 35)
              .innerRadius(radius - 40);

          var pie = d3.layout.pie()
              .sort(null)
              .value(function(d, index) { return d.value});

          tip
             .html(function(d) {
                 return d.data.label + ": " + Math.round((d.data.value / total_in_category) * 100) + "%";
             });

          var g = svg_prog_pie.selectAll(".arc")
              .data(pie(numbers))
              .enter().append("g")
              .attr("class", "arc");

          g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return colorscale(d.data.label)})
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide);

          g.append("text")
              .attr("transform", function(d) { return "translate(" + arcText.centroid(d) +")"; })
              .attr("dy", ".35em")
              .text(function(d) {
                if (d.data.value > 0) {
                  return d.data.label + ": " + Math.round((d.data.value / total_in_category) * 100) + "%";
                }
              });

      });
  };

};