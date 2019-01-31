var user_analytics = ['$scope', 'UserService', 
    function ($scope, UserService) {

        $scope.UserLoginsPastMonth = UserService.getUserLoginsPastMonth();
        $scope.UserRequestsTotalPastMonth = UserService.getUserRequestsTotalPastMonth();
        $scope.DatasetRequestsTotalPastMonth = UserService.getDatasetRequestsTotalPastMonth();
        $scope.LastUpdatedDatasets = UserService.getLastUpdatedDatasets();

        $scope.LoginsToday = 0;
        $scope.LoginsMonth = 0;
        $scope.TopRequestsMonth = 0;
        $scope.LatestUpload = "";

        $scope.DatasetRequestsTotalPastMonth.$promise.then(function () { 
            $scope.TopRequestsMonth = $scope.DatasetRequestsTotalPastMonth[0].Requests;
        });

        $scope.LastUpdatedDatasets.$promise.then(function () { 
            $scope.LatestUpload = $scope.LastUpdatedDatasets[0].LastUpdated;
        });

        $scope.UserLoginsPastMonth.$promise.then(function () { 
            var today = new moment().format('YYYY-MM-DD');
            
            $scope.UserLoginsPastMonth.forEach(function (row) { 
                if (today == row.RequestDate) //if it is today
                    $scope.LoginsToday = row.Logins;

                $scope.LoginsMonth += row.Logins; //add up our logins this month    

                $scope.loginData[0].values.push(row);                
                
            });
        });
        


        //UserLoginsPastMonth graph config
        $scope.loginOptions = {
            chart: {
                type: 'multiBarChart',
                width: 700,
                height: 400,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 65,
                    left: 50
                },
                x: function(d) { return moment(d.RequestDate).format('MMM D') },
                y: function (d) { return d.Logins },
                showLabels: true,
                showValues: true,
                showLegend: false,
                stacked: false,
                showControls: false,
                reduceXTicks: false, 
                text: function(d){return d.Logins;}, //show label
                transitionDuration: 500,
                xAxis: {
                    rotateLabels: 40,
                },
                yAxis: {
                    axisLabel: '# logins',
                    axisLabelDistance: -10,
                    tickFormat: function (d) {
                        return d3.format("~.0")(d);
                    },
                },
            }
        };
        $scope.loginData = [
            {
                "key" : "Logins",
                "bar" : true,
                "values" : []
            }
        ];

    }
];