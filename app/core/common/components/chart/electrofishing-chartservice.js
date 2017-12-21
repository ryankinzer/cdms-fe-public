
var electrofishing_chartservice = [ 
    function(){
        var service = {

        	dataset: "ElectroFishing",

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
			        var num = row.FishCount || 1;
			        var species = row.SpeciesRunRearing || row.OtherSpecies || row.Species || 'Not specified';
			        //console.log("species = " + species);

			        if(species)
			        {
			            if(!dataCalc[species])
			                dataCalc[species] = { total: 0 };

			            dataCalc[species].total += num;
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

				console.log("Inside chartservices.js, getChartData (EF, ST, FS, SGS), data is next...");
			    console.dir(data);

			    return data;

			},

			buildChart: function(){

			},

        };

        return service;
    }
];