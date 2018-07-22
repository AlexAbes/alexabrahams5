/*****************************************************************************/
// This is our innovative visualization of an interactive and updating word  //
// cloud, displaying varying perceptions of computer science concentrators.  //
// This is the leftmost word cloud under the "Perceptions of CS" section.    //
/*****************************************************************************/

var border = 1;
var bordercolor='black';

// var frequency_list = [{"text":"study","size":40},{"text":"motion","size":15},{"text":"forces","size":10}];   

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width_wordcloud = 500 - margin.left - margin.right,
    height_wordcloud = 350 - margin.top - margin.bottom;

// var fisheye = d3.fisheye.circular()
//     .radius(200)
//     .distortion(2);

var svg_wordcloud1 = d3.select("#wordcloud1").append("svg")
    .attr("width", width_wordcloud + margin.left + margin.right)
    .attr("height", height_wordcloud + margin.top + margin.bottom)
    .attr("class", "wordcloud1")
    .attr("style", "outline: thin solid black;")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data;


loadData();

function loadData() {
    d3.json("data/words.json", function(error, json) {
        if (error) return console.warn(error);
        data = json;
        UpdateVisualization();
    });
};

// Default values for wordcloud1
var selected1_gender = "0";
var selected1_pcsb = "all_pcsb";
var selected1_race = "all_race";

function UpdateVisualization() {
    // Get the filtered array
    selected1_gender = d3.select('input[name="gender1option"]:checked').node().value
    selected1_pcsb = d3.select('input[name="pcsb1option"]:checked').node().value
    selected1_race = d3.select('input[name="race1option"]:checked').node().value

    var tip = d3.select('#wordcloud1')
    .append('div')
    .attr('class', 'd3-tip-cloud');
    
    tip.append('div')
    .attr('class', 'text');

    // filter the array
    var gender_filter;
    var pcsb_filter;
    var race_filter;

    gender_filter = data.filter(function (d) {
        if (selected1_gender == "all_gender") {
            return data;
    } else {
        return (d["gender"] == selected1_gender);
    }
    });

    pcsb_filter = gender_filter.filter(function (d) {
        if (selected1_pcsb == "all_pcsb") {
            return gender_filter;
        } else {
            return (d["exp_level"] == selected1_pcsb);
        }
    });

    race_filter = pcsb_filter.filter(function (d) {
        if (selected1_race == "all_race") {
            return pcsb_filter;
        } else {
            return (d["race"] == selected1_race);
        }
    })

    var filteredData = race_filter;

    // create big array of words that we have filtered for
    var words_list = [];
    filteredData.forEach(function (d) {
        words_list = words_list.concat(d["words"]);
    })

    // get number of words
    var number_of_words = words_list.length;

    // create array of frequencies with words

    var word_frequencies = {};
    words_list.forEach(function (d) {
        word_frequencies[d] = {"text": d, "size": 0}
    });
    words_list.forEach(function (d) {
        word_frequencies[d].size++;
    });

    word_frequencies = d3.values(word_frequencies);
    console.log(word_frequencies);

    var greyscale = ["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"];

    var color2 = d3.scale.linear()
        .domain([0,1,2,3,4,5,6,10,15,20,100])
        .range(greyscale);

    d3.layout.cloud().size([700, 300])
        .words(word_frequencies)
        .rotate(0)
        .fontSize(function(d) { 
            return (d.size + 10); 
        })
        .on("end", draw)

        .start();



    // var wordcloud = svg_wordcloud1
    //         // without the transform, words words would get cutoff to the left and top, they would
    //         // appear outside of the SVG area
    //         .attr("transform", "translate(200,200)");
            

    function draw(words) {
        var wordcloud = svg_wordcloud1
            // without the transform, words words would get cutoff to the left and top, they would
            // appear outside of the SVG area
            .attr("transform", "translate(200,200)")
            .selectAll("text")
            .data(words);

        wordcloud.enter().append("text");

        wordcloud
            .style("font-size", function(d) {
                return d.size + "px"; 
            })
            .transition()
            .duration(1000)
            .style("fill", function(d, i) { return color2(i); })
            .attr("transform", function(d) {
                return "translate(" + [d.x, (d.y-38)] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });

        wordcloud
            .on('mouseover', function(d) {
                tip.select('.text').html("Word: " + d.text + "<br>Occurrences: " + (d.size - 10) + " ("
                 + (((d.size - 10)/(filteredData.length)) * 100).toFixed(2) + "%)");
                tip.style('display', 'block');
            })
            .on('mouseout', function() {
                tip.style('display', 'none');
            });

        wordcloud.exit()
        .transition()
        .duration(1000)
        .remove();
    }
}