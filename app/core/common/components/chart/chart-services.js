
//Chart Services - charting for different datasets.
//  If you want to build a custom chart for your dataset (we like it as a nice simple visual),
//  you'll just need to create your own chart service named "YourDataset_ChartService" for each one.
//  and use the below as example/ideas

//examples here: http://krispo.github.io/angular-nvd3/#/quickstart 

/*
		Each dataset type that you want to provide a generated graph needs to live here.
		You can do your graphing however you like for the particular kind of chart.
*/
var chart_services = ['AdultWeir_ChartService', 'WaterTemp_ChartService',
    'SnorkelFish_ChartService', 'ElectroFishing_ChartService', 'WaterQuality_ChartService', 
	'CreelSurvey_ChartService', 'ArtificialProduction_ChartService', 'BSample_ChartService','$compile',
    function (AdultWeir_ChartService, WaterTemp_ChartService,
        SnorkelFish_ChartService, ElectroFishing_ChartService, WaterQuality_ChartService,
        CreelSurvey_ChartService, ArtificialProduction_ChartService, BSample_ChartService, $compile){
		console.log("Inside chartservices.js, ChartService...");
		var service = {
			buildChart: function(scope, data_in, dataset, config){
				console.log("Inside ChartService, buildChart...");
				console.log("dataset = " + dataset);
				console.log("data_in is next...");
//					console.dir(data_in);

    			if(dataset == "AdultWeir") 
				{
					scope.chartConfig = AdultWeir_ChartService.getChartConfig();
		    		scope.chartData = AdultWeir_ChartService.getChartData(data_in);
				}
		    	else if(dataset == "WaterTemp")
		    	{
		    		WaterTemp_ChartService.buildChart(data_in, config);
		    	}
		    	else if(dataset == "SnorkelFish")
		    	{
		    		scope.chartConfig = SnorkelFish_ChartService.getChartConfig();
		    		scope.chartData   = SnorkelFish_ChartService.getChartData(data_in);
		    	}		    		
		    	else if(dataset == "Electrofishing" || dataset == "ScrewTrap" || dataset == "FishScales" || dataset == "SpawningGroundSurvey")
		    	{
		    		scope.chartConfig = ElectroFishing_ChartService.getChartConfig();
		    		scope.chartData   = ElectroFishing_ChartService.getChartData(data_in);
		    	}	
		    	else if(dataset == "WaterQuality")
		    	{
		    		scope.chartConfig = WaterQuality_ChartService.getChartConfig();
		    		scope.chartData   = WaterQuality_ChartService.getChartData(data_in);
		    	}
				else if(dataset == "CreelSurvey")
		    	{
					scope.chartConfig = CreelSurvey_ChartService.getChartConfig();
		    		scope.chartData = CreelSurvey_ChartService.getChartData(data_in);
		    	}
				else if(dataset == "ArtificialProduction")
		    	{
					scope.chartConfig = ArtificialProduction_ChartService.getChartConfig();
		    		scope.chartData = ArtificialProduction_ChartService.getChartData(data_in);
				}
    			else if(dataset == "BSample") 
				{
					scope.chartConfig = BSample_ChartService.getChartConfig();
		    		scope.chartData = BSample_ChartService.getChartData(data_in);
				}
		    	else 
		    		console.log("No charting configured for " + dataset);

                //build the chart!
                console.log("building the chart!");
                if (scope.chartConfig) {
                    console.log("we have a chart config ... building");
                    var template = '<nvd3 options="chartConfig" data="chartData"></nvd3>';
                    angular.element("#chart-inset").append($compile(template)(scope));
                }

		    },
		};

		return service;
	}
];
