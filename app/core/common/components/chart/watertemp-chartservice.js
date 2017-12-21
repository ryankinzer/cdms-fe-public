
var watertemp_chartservice = [ 
    function(){
        var service = {

        	dataset: "WaterTemp",

			buildChart: function(data_in, config)
			{
				if(data_in.length == 0)
					return;

				if(!config)
					config = {width: 400, height: 200};

					var margin = {top: 10, right: 10, bottom: 20, left: 30},
					    width = config.width - margin.left - margin.right,
					    height = config.height - margin.top - margin.bottom;

					var x = d3.time.scale()
					    .range([0, width]);

					var y = d3.scale.linear()
					    .range([height, 0]);

					var color = d3.scale.ordinal()
					  		.domain([1,12,13,14,15,16])
					  		.range(["FF0000","#009933" , "#0000FF","#0FF933" , "#00FFFF","#00FFAAFB"]);

					var xAxis = d3.svg.axis()
					    .scale(x)
					    .orient("bottom");

					var yAxis = d3.svg.axis()
					    .scale(y)
					    .orient("left");

					var line = d3.svg.line()
						//.interpolate("basis")
					    .x(function(d) { return x(d.chart_date); })
					    .y(function(d) { return y(d.chart_temp); });

					    d3.select("#chart-div").selectAll("svg").remove();

					var svg = d3.select("#chart-div").append("svg")
					    .attr("width", width + margin.left + margin.right)
					    .attr("height", height + margin.top + margin.bottom)
					  .append("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	
					//converting via new Date() seems to work better.
					//var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;

					//color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

					var data = [];

					data_in.forEach(function(d) {
					  	//only show rows with default QA status (OK)
					  	//if(d.QAStatusId == scope.dataset.DefaultRowQAStatusId)
					  	//{
					  	if(!isNaN(d.WaterTemperature))
					  	{
					  		d.chart_date = new Date(d.ReadingDateTime);
					    	d.chart_temp = +d.WaterTemperature;
					    	d.chart_QAStatusId = d.QAStatusId;
					    	data.push(d);
					    }
					    //}

					    //console.dir(d);
                    });

                    //sort by date so that our graph isn't wonky
                    data = data.sort(function (a, b) { return a.chart_date - b.chart_date });

					//console.dir(data);

					  //x.domain(d3.extent(data, function(d) { return d.date; }));
					  //y.domain(d3.extent(data, function(d) { return d.close; }));


					  x.domain(d3.extent(data, function(d) { return d.chart_date; }));
					  y.domain(d3.extent(data, function(d) { return d.chart_temp; }));

					  svg.append("g")
					      .attr("class", "x axis")
					      .attr("transform", "translate(0," + height + ")")
					      .call(xAxis);

					  svg.append("g")
					      .attr("class", "y axis")
					      .call(yAxis)
					    .append("text")
					      .attr("transform", "rotate(-90)")
					      .attr("y", 6)
					      .attr("dy", ".71em")
					      .style("text-anchor", "end")
					      .text("H2O Temp (C)");

					  svg.append("path")
					      .datum(data)
					      .attr("class", "line")
					      .attr("d", line);
					      /*
					      .style("stroke", function(d,i) { 
					      	console.dir(d);
					      	console.dir(i);
					      	console.dir(color(d.chart_QAStatusId));
					      	return color(d.chart_QAStatusId); 
					      });*/
			},
        };

        return service;
    }
];
