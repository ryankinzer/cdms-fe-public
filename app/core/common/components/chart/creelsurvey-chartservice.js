
var creelsurvey_chartservice = [ 
    function(){
		//console.log("Inside CreelSurvey_ChartService...");
        var service = {

        	dataset: "CreelSurvey",

			getChartConfig: function(){
				var config = {
    			  title : 'Fish by Species',
				  tooltips: true,
                  showControls: false,
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
			                dataCalc[row.Species] = { total: 0, males: 0, females: 0};

			            dataCalc[row.Species].total += num;

			            if(row.Sex == "M")
			                dataCalc[row.Species].males += num;
			            if(row.Sex == "F")
			                dataCalc[row.Species].females += num;
			            
			        }
			        
			        //console.log(row.Species + " = ");
			        //console.dir(dataCalc[row.Species]);
			        
			    });

			    var data = {
			              "series": [
			                "Total",
			                "Male",
			                "Female"
			              ],
			              "data": [
			              ]
			            };

			    angular.forEach(dataCalc, function(vals, species){
			        data['data'].push({
			          "x": species,
			          "y": [vals.total,vals.males,vals.females],
			        });
			    });

				//console.log("Inside chartservices.js, CreelSurvey, at end of getChartData, data is next...");
			    //console.dir(data);

			    return data;

			},

			buildChart: function(){

			},

        };

        return service;
    }
];