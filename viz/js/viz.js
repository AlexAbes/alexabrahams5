var selectedState = 'New York';

// Load the data
queue()
  .defer(d3.csv, "data/Appeal_Process_Links.csv")
  .defer(d3.csv, "data/Court_Augmented.csv")
  .await(createVis);

function createVis(error, links, courts){
  console.log(links);

  // Filter out links that are not in the selected State
  links = links.filter(function(d) {
    return d['USStateName'] == selectedState;
  });

  var nodes = {};

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    // if nodes doesn't already have link.source in it, nodes[link.source] returns undefined,
    // in which case nodes[link.source] is set to be {name: link.source}
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    // similar with link.target
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  console.log(links);

  var width = 960,
      height = 500;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(60)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("#viz").append("svg")
      .attr("width", width)
      .attr("height", height);

  // Per-type markers, as they don't inherit styles.
  // Markers are the arrowheads, which are currently missing
  svg.append("defs").selectAll("marker")
      // need to fix the source data here
      .data(["suit", "licensing", "resolved"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
    .enter().append("path")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
    .enter().append("circle")
      .attr("r", 12)
      .call(force.drag);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
    .enter().append("text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { return d.name; });

  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }
};