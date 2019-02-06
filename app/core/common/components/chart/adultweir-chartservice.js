var adultweir_chartservice =  [
    function () {
        var service = {

            dataset: "AdultWeir",

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
                        showControls: false,
                        showLegend: false,
                        yAxis: {
                            tickFormat: function (d) {
                                return d3.format("~.0")(d);
                            },
                        }
                    },
                    title: {
                        enable: true,
                        text: 'Fish by Species'
                    },
                };

                return options;

            },


            getChartData: function (data) {

                /* -- this is the format we need to return for the series to work -- 
                var retvaldata = [
                    {
                        "key": "Female",
                        "color": "#d62728",
                        "values": [
                            {
                                "label": "CHS",
                                "value": 4
                            },
                            {
                                "label": "STH",
                                "value": 3
                            },
                            
                        ]
                    },
                    {
                        "key": "Male",
                        "color": "#1f77b4",
                        "values": [
                            {
                                "label": "CHS",
                                "value": 2
                            },
                            {
                                "label": "STH",
                                "value": 13
                            },
                            
                        ]
                    }
                ];
                */

                
                var dataCalc = {};

                data.forEach(function (row, key) {
                    var num = 1;
                    if (row.TotalFishRepresented)
                        num = row.TotalFishRepresented;
                    else if (row.FishCount)
                        num = row.FishCount;
                    
                    if (row.Sex && row.Species) {

                        if (!dataCalc[row.Sex])
                            dataCalc[row.Sex] = {};

                        if(!dataCalc[row.Sex][row.Species])
                            dataCalc[row.Sex][row.Species] = num;
                        else
                            dataCalc[row.Sex][row.Species] += num;

                    }

                });

                var color = {
                    'M': "#1f77b4",
                    'F': "#d62728",
                    'UNK': "#f4b042",
                };

                var label = {
                    'M': "Male",
                    'F': "Female",
                    'UNK': "Unknown",
                };

                var data = [];
                
                Object.keys(dataCalc).forEach(function (sex) {
                    var the_count = [];
                    Object.keys(dataCalc[sex]).forEach(function (species) {
                        var val = dataCalc[sex][species];
                        the_count.push({ 'label': species, 'value': val });
                    });

                    data.push({
                        "key": label[sex],
                        "color": color[sex],
                        "values": the_count
                    });
                });

                return data;
            },
        };

        return service;
    }
];
