/*****************************************************************************/
// This is the visualization that toggles between faculty and TFs to portray //
// the accessibility of each, based on a 1 through 5 rating scale. This is   //
// under the "Accessing the Department" section.                             //
/*****************************************************************************/

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width_access = 1200 - margin.left - margin.right,
    height_access = 200 - margin.top - margin.bottom;

var color_scale = d3.scale.ordinal()
    .range(["#633636", "#945951", "#dbc1bd", "#82acc9", "#457aa1"]);

var svg_access = d3.select("#access_bar").append("svg")
    .attr("width", width_access + margin.left + margin.right)
    .attr("height", height_access + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var profdata = [
    {label: '1', value: 13, x: 0},
    {label: '2', value: 35, x: 13},
    {label: '3', value: 57, x: 48},
    {label: '4', value: 45, x: 105},
    {label: '5', value: 19, x: 150}
];

var tfdata = [
	{label: '1', value: 0, x: 0},
    {label: '2', value: 7, x: 0},
    {label: '3', value: 20, x: 7},
    {label: '4', value: 77, x: 27},
    {label: '5', value: 65, x: 104}
];

var tips = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0]);

svg_access.call(tips);


var profscale = d3.scale.linear()
	.range([0, width_access])
	.domain([0, 169]);

tips
    .html(function(d) {
        return "Percentage of Concentrators who rated " + d.label + ": " + "<br>" + ((d.value/169)*100).toFixed(2) + "%";
    });

//drawbars(profdata, 100);

function drawbars(data, int) {

d3.selectAll("#barzzz").remove();
d3.selectAll("#bartext").remove();

var bar = svg_access.selectAll("rect")
      .data(data)

bar
    .enter().append("rect")
    .attr("id", "barzzz")
      .attr("width",  function(d) {
      	return profscale(d.value);
      })
      .attr("height", 100)
      .attr("x", function(d) {
      	return profscale(d.x);
      })
      .attr("y", height_access - int) //100
      .on('mouseover', tips.show)
      .on('mouseout', tips.hide)
      .style("fill", function(d) { return color_scale(d.label); });

var txt = svg_access.selectAll("text")
	.data(data)

txt	
	.enter()
	.append("text")
	.attr("id", "bartext")
	.attr("x", function(d) {
		return profscale(d.x + (d.value/2) - 1.5);
	})
	.attr("y", height_access - (int - 60)) //40
	.text(function(d) {
		if (d.value == 0) {
			return "";
		}
		else {
			return d.label;
		}
	})
	.attr("fill", "white")
	.attr("font-size", "32px");

	// bar.exit().remove();

	// txt.exit().remove();

}


console.log(profscale(35));