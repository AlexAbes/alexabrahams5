/*****************************************************************************/
// This is our innovative visualization of an interactive and updating word  //
// cloud, displaying varying perceptions of computer science concentrators.  //
// This is the rightmost word cloud under the "Perceptions of CS" section.   //
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

var svg_wordcloud2 = d3.select("#wordcloud2").append("svg")
    .attr("width", width_wordcloud + margin.left + margin.right)
    .attr("height", height_wordcloud + margin.top + margin.bottom)
    .attr("class", "wordcloud1")
    .attr("style", "outline: thin solid black;")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data2;


loadData2();

function loadData2() {
    d3.json("data/words.json", function(error, json) {
        if (error) return console.warn(error);
        data2 = json;
        UpdateVisualization2();
    });
};

// Default values for wordcloud1
var selected2_gender = "0";
var selected2_pcsb = "all_pcsb";
var selected2_race = "all_race";

function UpdateVisualization2() {
    // Get the filtered array
    selected2_gender = d3.select('input[name="gender2option"]:checked').node().value
    selected2_pcsb = d3.select('input[name="pcsb2option"]:checked').node().value
    selected2_race = d3.select('input[name="race2option"]:checked').node().value

    var tip = d3.select('#wordcloud2')
    .append('div')
    .attr('class', 'd3-tip-cloud');

    tip.append('div')
    .attr('class', 'text');

    // filter the array
    var gender_filter2;
    var pcsb_filter2;
    var race_filter2;

    gender_filter2 = data2.filter(function (d) {
        if (selected2_gender == "all_gender") {
            return data2;
    } else {
        return (d["gender"] == selected2_gender);
    }
    });

    pcsb_filter2 = gender_filter2.filter(function (d) {
        if (selected2_pcsb == "all_pcsb") {
            return gender_filter2;
        } else {
            return (d["exp_level"] == selected2_pcsb);
        }
    });

    race_filter2 = pcsb_filter2.filter(function (d) {
        if (selected2_race == "all_race") {
            return pcsb_filter2;
        } else {
            return (d["race"] == selected2_race);
        }
    })

    var filteredData2 = race_filter2;

    // create big array of words that we have filtered for
    var words_list2 = [];
    filteredData2.forEach(function (d) {
        words_list2 = words_list2.concat(d["words"]);
    })

    // create array of frequencies with words

    var word_frequencies2 = {};
    words_list2.forEach(function (d) {
        word_frequencies2[d] = {"text": d, "size": 0}
    });
    words_list2.forEach(function (d) {
        word_frequencies2[d].size++;
    });

    word_frequencies2 = d3.values(word_frequencies2);
    console.log(word_frequencies2);

    var greyscale2 = ["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"];

    var color2 = d3.scale.linear()
        .domain([0,1,2,3,4,5,6,10,15,20,100])
        .range(greyscale2);

    d3.layout.cloud().size([700, 300])
        .words(word_frequencies2)
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
            

    function draw(words2) {
        var wordcloud2 = svg_wordcloud2
            // without the transform, words words would get cutoff to the left and top, they would
            // appear outside of the SVG area
            .attr("transform", "translate(200,200)")
            .selectAll("text")
            .data(words2);

        wordcloud2.enter().append("text");

        wordcloud2
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

        wordcloud2
            .on('mouseover', function(d) {
                tip.select('.text').html("Word: " + d.text + "<br>Occurrences: " + (d.size - 10) + " ("
                 + (((d.size - 10)/(filteredData2.length)) * 100).toFixed(2) + "%)");
                tip.style('display', 'block');
            })
            .on('mouseout', function() {
                tip.style('display', 'none');
            });

        wordcloud2.exit()
        .transition()
        .duration(1000)
        .remove();
    }
}