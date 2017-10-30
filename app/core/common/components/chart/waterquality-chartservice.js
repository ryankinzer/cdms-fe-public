var water_quality = [ 
    function(){
        var service = {

        	dataset: "WaterQuality",

			getChartConfig: function(){
				var config = {
    			  title : 'Sample Count',
				  tooltips: true,
				  labels : false,
				  
				  legend: {
				    display: true,
				    position: 'right'
				  }
				};

				return config;
			},


			getDefaultChartData: function()
			{
				var defaultChartData = {"series": [], "data":[{ "x": "Loading...", "y": [0],"tooltip": ""}]}; //default
				return defaultChartData;
			},


			getChartData: function(data)
			{
			    var dataCalc = {};

			    angular.forEach(data, function(row, key){
			        var characteristic = row.CharacteristicName || 'Unknown';

			        if(characteristic)
			        {
			            if(!dataCalc[characteristic])
			                dataCalc[characteristic] = { total: 0 };

			            dataCalc[characteristic].total++;
			        }
			    });

			    var data = {
			              "series": ["Total"],
			              "data": [] 
			          };

			    angular.forEach(dataCalc, function(vals, characteristic){
			        data['data'].push({
			          "x": characteristic,
			          "y": [vals.total],
			        });
			    });

			    return data;

			},

			buildChart: function(){

			},

        };

        return service;
    }
];
