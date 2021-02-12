// Created by Alex Abrahams
// February 11, 2021

var width = 400,
    height = 400;

var projection = d3.geo.albers();


/*
var projection = d3.geo.transverseMercator()
          .rotate([120 + 30 / 60, -38 - 50 / 60])

*/

var path = d3.geo.path()
    .projection(projection);

// color scale
var length = 70000;
var color = d3.scale.linear()
    .domain([1,length])
    // .range(["#ffffff", "#009925"]);
    .range(["white", "green"]);

// Function to add thousands separator to numbers
function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
};

// Function to turn a decimal into a percentage string
function percentify(num) {
    return parseFloat(num*100).toFixed(0)+"%"
};

// Object dictionary for columns to strings
var columnDict = {
    "AbsenteeApplications": "Absentee Ballot Applications",
    "BallotsSent" : "Absentee Ballots Sent Out",
    "BallotsReturned" : "Absentee Ballots Returned",
    "InPersonAbsentee" : "In Person Absentee Votes",
    "pct_ballots_sent_out" : "% of Absentee Ballot Applications Sent Out",
    "pct_ballots_sent_returned" : "% of Absentee Ballot Applications Returned"
};

// Function to remove and re-add table with new data source
function tableCreator(top5Data) {
    // Delete the existing tables
    $("#top5_table").remove();

    // Add the table elements back in
    $("#top5_table_holder").after("<table id=\"top5_table\" data-sortable=\"true\"></table>")

    // Construct top 5 table from data
    $('#top5_table').bootstrapTable({
      columns: [{
        field: 'Jurisdiction',
        title: 'County<br>'
      },{
        field: 'AbsenteeApplications',
        title: "Absentee Ballot<br>Applications"
      }, {
        field: 'BallotsSent',
        title: "Absentee Ballots<br>Sent Out"
      }, {
        field: 'pct_ballots_sent_out',
        title: "% of Absentee Ballot<br>Applications Sent Out"
      }, {
        field: 'BallotsReturned',
        title: "Absentee Ballots<br>Returned"
      }, {
        field: 'pct_ballots_sent_returned',
        title: "% of Absentee Ballot<br>Applications Returned"
      }, {
        field: 'InPersonAbsentee',
        title: "In Person<br>Absentee Votes"
      }],
      sortable: true,
      data: top5Data
    }); 

};

// Traffic color scale for percentages
var trafficColor = d3.scale.linear()
    .domain([0, 0.5, 1])
    .range(['red', 'yellow', 'green']);

// Boolean for whether the SVG already exists
var svgExists = false;

// Main function to draw the map
// data_source will be given from the dropdown menu
function switchData(data_source) {

    // Load the absentee votes data
    d3.csv("data/absentee_counts_data.csv", function(data) {

        var total_array;

        // Turn the absentee data array into an object where the key is the county FIPS code and value is the row object
        var absentee_counts_obj = {};
        for (var i = 0; i < data.length; i++) {
            // Calculate percentages
            var pct_ballots_sent_out = data[i]["BallotsSent"] / data[i]["AbsenteeApplications"];
            var pct_ballots_sent_returned = data[i]["BallotsReturned"] / data[i]["BallotsSent"];
            data[i]["pct_ballots_sent_out"] = pct_ballots_sent_out;
            data[i]["pct_ballots_sent_returned"] = pct_ballots_sent_returned;

            absentee_counts_obj[data[i].county_fips] = data[i];

            // Retrieve the total row from the array
            if (data[i]["Jurisdiction"] == "TOTAL") {
                total_array = data[i];
            }
        };

        // Get the top 5 counties by the chosen data source
        // Sort the array of objects and then only get top 5, ignoring Total row
        // Assumes there will always be a total row
        var x = JSON.parse(JSON.stringify(data)); // deep copy to prevent data itself being altered
        // need to check whether pct or integers needed:
        if ((data_source == "pct_ballots_sent_out") || (data_source == "pct_ballots_sent_returned")) {
            var top5Data = (x.sort((a, b) => (a[data_source] > b[data_source]) ? -1 : 1)).slice(1,6);
        } else {
            var top5Data = (x.sort((a, b) => (parseInt(a[data_source]) > parseInt(b[data_source])) ? -1 : 1)).slice(1,6);
        }

        // format the data as needed
        for (var k = 0; k < top5Data.length; k++) {
            top5Data[k]["AbsenteeApplications"] = formatNumber(top5Data[k]["AbsenteeApplications"]);
            top5Data[k]["BallotsSent"] = formatNumber(top5Data[k]["BallotsSent"]);
            top5Data[k]["BallotsReturned"] = formatNumber(top5Data[k]["BallotsReturned"]);
            top5Data[k]["InPersonAbsentee"] = formatNumber(top5Data[k]["InPersonAbsentee"]);
            top5Data[k]["pct_ballots_sent_out"] = percentify(top5Data[k]["pct_ballots_sent_out"]);
            top5Data[k]["pct_ballots_sent_returned"] = percentify(top5Data[k]["pct_ballots_sent_returned"]);
        }

        // Create the table using the top5 data
        tableCreator(top5Data);

        // Update table title to say which data source is being shown
        document.getElementById("title").innerHTML = "Top 5 counties by " + columnDict[data_source];
        document.getElementById("currentDataSource").innerHTML = "Map currently shows data on " + columnDict[data_source];

        d3.json("data/us_counties.json", function(error, us) {
            if (error) throw error;

            // Update the county detail area
            function pickCounty(county){
                // Retrieve data on specified county
                var value = absentee_counts_obj[county.id];

                document.getElementById("county_title").innerHTML = "<strong>Selected County: </strong> " + value["Jurisdiction"];
                var statsParagaph = `
                <strong>Absentee Ballot Applications: </strong>${formatNumber(value["AbsenteeApplications"])}
                <br>
                <strong>Absentee Ballots Sent Out: </strong>${formatNumber(value["BallotsSent"])}
                <br>
                <strong>% of Absentee Ballot Applications Sent Out: </strong><span id="cty_pct_ballots_sent_out">${percentify(value["pct_ballots_sent_out"])}</span>
                <br>
                <strong>Absentee Ballots Returned: </strong>${formatNumber(value["BallotsReturned"])}
                <br>
                <strong>% of Absentee Ballot Applications Returned: </strong><span id="cty_pct_ballot_apps_returned">${percentify(value["pct_ballots_sent_returned"])}</span>
                <br>
                <strong>In Person Absentee Votes: </strong>${formatNumber(value["InPersonAbsentee"])}
                `
                document.getElementById("county_details").innerHTML = statsParagaph;
                // Set the colors of the percentage fonts
                document.getElementById("cty_pct_ballots_sent_out").style.color = trafficColor(value["pct_ballots_sent_out"]);
                document.getElementById("cty_pct_ballot_apps_returned").style.color = trafficColor(value["pct_ballots_sent_returned"]);
            }

            // Check whether the SVG already exists
            if (svgExists) {
                // Then delete it
                document.getElementById("map_svg").remove();
            } else {
                // if this is the first load of the page, svgExists will still be false
                // therefore you should call the county data function for Dane for default
                pickCounty({"id": "55025"});
            }

            // Tooltip
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    // Retrieve the county name and stats from absentee counts data
                    var value = absentee_counts_obj[d.id];
                    if ((data_source == "pct_ballots_sent_out") || (data_source == "pct_ballots_sent_returned")) {
                        return (value["Jurisdiction"] +"<br>" + columnDict[data_source] + ": " + percentify(value[data_source]));
                    } else {
                        return (value["Jurisdiction"] +"<br>" + columnDict[data_source] + ": " + formatNumber(value[data_source]));
                    }
                });

            var svg = d3.select("#chart-area").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr('id', 'map_svg');

            svgExists = true;

            // Add the totals numbers to the page
            document.getElementById("absentee_ballot_apps").innerHTML = formatNumber(total_array["AbsenteeApplications"]);
            document.getElementById("absentee_ballots_sent").innerHTML = formatNumber(total_array["BallotsSent"]);
            document.getElementById("absentee_ballots_returned").innerHTML = formatNumber(total_array["BallotsReturned"]);
            document.getElementById("in_person_votes").innerHTML = formatNumber(total_array["InPersonAbsentee"]);
            document.getElementById("pct_ballot_apps_sent").innerHTML = percentify(total_array["pct_ballots_sent_out"]);
            document.getElementById("pct_ballot_apps_returned").innerHTML = percentify(total_array["pct_ballots_sent_returned"]);
            // Set the colors of the percentage fonts
            document.getElementById("pct_ballot_apps_sent").style.color = trafficColor(total_array["pct_ballots_sent_out"]);
            document.getElementById("pct_ballot_apps_returned").style.color = trafficColor(total_array["pct_ballots_sent_returned"]);

            // filter the states to just Wisconsin (ID 55)
            var states = topojson.feature(us, us.objects.states),
                state = states.features.filter(function(d) { return d.id === 55; })[0];

            // Loop through each county in JSON and see if it has a matching value in the absentee counts data
            // Use county FIPs (in absentee) and ID field in counties JSON to match
            for (var i = us.objects.counties.geometries.length - 1; i >= 0; i--) {

                var currentCountyJSON = us.objects.counties.geometries[i];

                // Check if its a WI county
                if (currentCountyJSON["id"].toString().substring(0,2) == "55") {

                    // Then proceed to retrieve its absentee votes data
                    for (var j = data.length - 1; j >= 0; j--) {

                        if (data[j]["county_fips"] == currentCountyJSON["id"]) {
                            us.objects.counties.geometries[i]["absentee"] = data[j];

                            // Stop looking through the absentee daat
                            break;
                        }
                    }

                }

            }

            projection.scale(1)
                .translate([0, 0]);
             
            var b = path.bounds(state),
                s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
             
            projection.scale(s)
                .translate(t);

            /* Invoke the tip in the context of your visualization */
            svg.call(tip);

            svg.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("class", "mesh")
                .attr("d", path);

            svg.append("path")
                .datum(state)
                .attr("class", "outline")
                .attr("d", path)
                .attr('id', 'land');

            svg.append("clipPath")
                .attr("id", "clip-land")
                .append("use")
                .attr("xlink:href", "#land");

            svg.selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .attr("d", path)
                .attr('county-id', function(d){
                   return d.id;
                }).attr("clip-path", "url(#clip-land)")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on("click", function(d) {
                    pickCounty(d);
                })
                .style("fill", function(d) {
                    if (d["id"].toString().substring(0,2) == "55") {
                        var value = absentee_counts_obj[d.id];

                        if (value) {
                            //If value exists…
                            // Check which data source has been selected
                            if ((data_source == "pct_ballots_sent_out") || (data_source == "pct_ballots_sent_returned")) {
                                return trafficColor(value[data_source]);
                            } else {
                                return color(parseInt(value[data_source]));    
                            }
                        } else {
                            //If value is undefined…
                            return "#ccc";
                            console.log(d);
                        }
                    }
                })
                .attr('class', 'county');
              

        });
    });
};

// Set default as the Absentee ballot applications total
switchData("AbsenteeApplications");
