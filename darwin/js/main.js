/**
 * Created by Alex on 19/04/2016.
 */

var width = 400,
    height = 400;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height);


// 1) INITIALIZE FORCE-LAYOUT
var force = d3.layout.force()
    .size([width, height])
    .linkDistance([50])
    .charge([-100]);

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return d.name;
    });

// set the colors for fill
var pro = "steelblue";
var anti = "#F65E61";
var other = "#631639";


// Load data
d3.json("data/people.json", function(data) {

    console.log(data);

    data.links.forEach(function(link, index, list) {
        if (typeof data.nodes[link.source] === 'undefined') {
            console.log('undefined source', link);
        }
        if (typeof data.nodes[link.target] === 'undefined') {
            console.log('undefined target', link);
        }
    });


    // 2a) DEFINE 'NODES' AND 'EDGES'
    force
        .nodes(data.nodes)
        .links(data.links);
    // 2b) START RUNNING THE SIMULATION
    force.start();

    // 3) DRAW THE LINKS (SVG LINE)
    var edges = svg.selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

    /* Invoke the tip in the context of your visualization */
    svg.call(tip);


    // 4) DRAW THE NODES (SVG CIRCLE)
    var node = svg.selectAll(".node")
        .data(data.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) {
            console.log(d.weight);
            return (d.weight) + 10;
        })
        .attr("fill", function(d) {
            if (d.color == "anti") {
                return anti;
            } else if (d.color == "pro") {
                return pro;
            } else {
                return other;
            }
        })
        .call(force.drag);

    node
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on("click", function(d) {
            showParagraph(d);
        });

    // 5) LISTEN TO THE 'TICK' EVENT AND UPDATE THE X/Y COORDINATES FOR ALL ELEMENTS
    force.on("tick", function() {

        // Update node coordinates
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        // Update edge coordinates
        edges.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; })
    });

    // TITLES
    node.append("title")
        .text(function(d) {
            console.log(d.name);
            return d.name;
        });
});

function showParagraph(d) {
    console.log(d);
    d3.select("#title").text(d.name);
    d3.select("#para").text(d.para);
    d3.select("#links_title").text("Links");
    d3.select("#links").text(d.links);
}