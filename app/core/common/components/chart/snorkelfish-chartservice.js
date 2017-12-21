var snorkelfish_chartservice = [ 
    function(){
		//console.log("Inside SnorkelFish_ChartService...");
        var service = {

        	dataset: "SnorkelFish",

			getChartConfig: function(){
				var config = {
    			  title : 'Fish Count',
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
			        //var num = (row.TotalFishRepresented) ? row.TotalFishRepresented : 1; // From AdultWeir
			        var num = row.FishCount;
			        //console.log("row is next...");
					//console.dir(row);
					//console.log("num = " + num);

			        if(row.Species)
			        {
						//console.log("Inside row.Species if...");
			            if(!dataCalc[row.Species])
			                dataCalc[row.Species] = { total: 0 };

			            dataCalc[row.Species].total += num;
			        }
			    });

			    var data = {
			              "series": ["Total"],
			              "data": [] 
			          };

			    angular.forEach(dataCalc, function(vals, species){
			        data['data'].push({
			          "x": species,
			          "y": [vals.total],
			        });
			    });

				console.log("Inside chartservices.js, snorkelfish at end of getChartData, data is next...");
			    console.dir(data);

			    return data;

			},

			buildChart: function(){

			},

        };

        return service;
    }
];
