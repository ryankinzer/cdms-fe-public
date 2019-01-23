var waterquality_chartservice = [ 
    function(){
        var service = {

        	dataset: "WaterQuality",

			getChartConfig: function () {

                var options = {
                    chart: {
                        type: 'multiBarChart',
                        height: 230,
                        width: 500,
                        x: function (d) { return d.label; },
                        y: function (d) { return d.value; },
                        showLabels: true,
                        //duration: 500,
                        labelThreshold: 0.01,
                        //labelSunbeamLayout: true,
                        showLegend: false,
                        yAxis: {
                            tickFormat: function (d) {
                                return d3.format("~.0")(d);
                            },
                        }
                    },
                    title: {
                        enable: true,
                        text: 'Sample Count'
                    },
                    
                };

                return options;

            },

            getChartData: function (data) {

                var dataCalc = {
                    'Total': {}
                };

                //count up the total by species
                data.forEach(function (row, key) {

                    var num = 1;
			        var characteristic = row.CharacteristicName || 'Unknown';

                    if (!dataCalc['Total'][characteristic])
                        dataCalc['Total'][characteristic] = num;
                    else
                        dataCalc['Total'][characteristic] += num;
                });

                var data = [];
                
                Object.keys(dataCalc).forEach(function (key) {
                    var the_count = [];
                    Object.keys(dataCalc[key]).forEach(function (species) {
                        var val = dataCalc[key][species];
                        the_count.push({ 'label': species, 'value': val });
                    });

                    data.push({
                        "key": key,
                        //"color": color[sex],
                        "values": the_count
                    });
                });

                return data;
            },


        };

        return service;
    }
];
