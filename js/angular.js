//bat_plot.js should be loaded for this javascript to work
//
//
var app = angular.module('myApp', ["ngRoute", 'ui.bootstrap', "highcharts-ng"]);

   
app.config(function($routeProvider) {
  //$locationProvider.hashPrefix(''); //http://stackoverflow.com/questions/41214312/exclamation-mark-after-hash-in-angularjs-app/41551864#41551864
  $routeProvider
  .when("/actualStates", {
    templateUrl: "../actualStates.html",
    controller: "myCtrl"
  })
  .when("/", {
    templateUrl: "home.html",
    controller: "mainCtrl"
  })
  .when("/statistics", {
    templateUrl: "../statistics.html",
    controller: "statCtrl"
  });
});

app.controller('myCtrl', function($scope, $rootScope, $http, $timeout) {
});

app.controller('mainCtrl', function($scope, $location) {
  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };
});

app.controller("statCtrl", function($scope, $rootScope){
  $scope.tabs = [
    { title:'All', content:
      "test"
    },

  { title:'Voltages', content:'Dynamic content 2'},
  { title:'Temperatures', content:'Dynamic content 3'},
  { title:'BleedingCtrl', content:'Dynamic content 4'}
];
function zip(arrays) {
  return arrays[0].map(function(_,i){
    return arrays.map(function(array){return array[i]})
});
}

var init1 = 0;
var init2 = 0;
var init3 = 0;
var init4 = 0;

$scope.drawHighCh = function(num){
  setTimeout(function(){
    if (num == 1 && init1 == 0){
      init1 = 1;
      var shiftOrNot1 = false;
      var seriesList = [];
      for (key in $rootScope.dict){
        if (key != "Timestamp"){
          seriesList.push({'name': key,
             'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict[key].slice(Math.max($rootScope.dict[key].length - 30, 1))])})
        }
      }
      $rootScope.chart1Config = new Highcharts.Chart({
        chart: {
          renderTo: 'tab'+num.toString(),
          events: {
          load: function () {
            var series = this.series;
            setInterval(function () {
              if (!shiftOrNot1 && $rootScope.dict["Timestamp"].length > 30){
                shiftOrNot1 = true;
                console.log("turned shifting on");
              };
              var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                  y;
              for (var key in $rootScope.dict){
                //console.log(key);
                if (key != "Timestamp"){
                  y = $rootScope.dict[key][$rootScope.dict[key].length - 1];
                  series[key].addPoint([x, y], true, shiftOrNot1);
                }
              };
              //y = $rootScope.dict["2"][$rootScope.dict["2"].length - 1];
              //series[2].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["3"][$rootScope.dict["3"].length - 1];
              //series[3].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["Current"][$rootScope.dict["Current"].length - 1];
              //series[4].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["temp1"][$rootScope.dict["temp1"].length - 1];
              //series[5].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["temp2"][$rootScope.dict["temp2"].length - 1];
              //series[6].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["temp3"][$rootScope.dict["temp3"].length - 1];
              //series[7].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["temp4"][$rootScope.dict["temp4"].length - 1];
              //series[8].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["Sl0Bl"][$rootScope.dict["Sl0Bl"].length - 1];
              //series[9].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["Sl1Bl"][$rootScope.dict["Sl1Bl"].length - 1];
              //series[10].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["Sl2Bl"][$rootScope.dict["Sl2Bl"].length - 1];
              //series[11].addPoint([x, y], true, shiftOrNot1);
              //y = $rootScope.dict["Sl3Bl"][$rootScope.dict["Sl3Bl"].length - 1];
              //series[12].addPoint([x, y], true, shiftOrNot1);
              }, 1000);
            }
          }
          //animation: Highcharts.svg
          //type: 'line',
          //zoomType: 'xy',
          //animation: true
          //width: x,
          //height: y
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y<br/>%m-%d',
            week: '%Y<br/>%m-%d',
            month: '%Y-%m',
            year: '%Y'
          },

          title: {
            text: "Time" 
          }
        },
        yAxis: {
          title: {
            text: "Voltage/Temperature/Bleeding [-]"
          }
        },
        rangeSelector: {
          selected: 1
        },
        series:seriesList, 
          //[
          //{'name': 'Cel0-voltage',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['0'].slice(Math.max($rootScope.dict["0"].length - 30, 1))])},
          //{'name': 'Cel1-voltage',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['1'].slice(Math.max($rootScope.dict['1'].length - 30, 1))])},
          //{'name': 'Cel2-voltage',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['2'].slice(Math.max($rootScope.dict['2'].length - 30, 1))])},
          //{'name': 'Cel3-voltage',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['3'].slice(Math.max($rootScope.dict['3'].length - 30, 1))])},
          //{'name': 'Current',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Current'].slice(Math.max($rootScope.dict['Current'].length - 30, 1))])},
          //{'name': 'Cel0-temperature',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp1'].slice(Math.max($rootScope.dict['temp1'].length - 30, 1))])},
          //{'name': 'Cel1-temperature',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp2'].slice(Math.max($rootScope.dict['temp2'].length - 30, 1))])},
          //{'name': 'Cel2-temperature',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp3'].slice(Math.max($rootScope.dict['temp3'].length - 30, 1))])},
          //{'name': 'Cel3-temperature',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp4'].slice(Math.max($rootScope.dict['temp4'].length - 30, 1))])},
          //{'name': 'Cel0-bleeding',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl0Bl'].slice(Math.max($rootScope.dict['Sl0Bl'].length - 30, 1))]),
          // 'step': 'left'},
          //{'name': 'Cel1-bleeding',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl1Bl'].slice(Math.max($rootScope.dict['Sl1Bl'].length - 30, 1))]),
          //'step': 'left'},
          //{'name': 'Cel2-bleeding',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl2Bl'].slice(Math.max($rootScope.dict['Sl2Bl'].length - 30, 1))]),
          //'step': 'left'},
          //{'name': 'Cel3-bleeding',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl3Bl'].slice(Math.max($rootScope.dict['Sl3Bl'].length - 30, 1))]),
          //'step': 'left'}
          //],
        title: {
            text: "Battery all stats"
        }
      })
    } else if (num == 2 && init2 == 0){
      init2 = 1;
      var shiftOrNot = false;
      var seriesVoltages = [];
      for (key in $rootScope.dict){
        if (parseInt(key) || parseInt(key) == 0){
          seriesVoltages.push(key);
        }
      }
      console.log(seriesVoltages);
      $rootScope.chart2Config = new Highcharts.Chart({
        chart: {
          renderTo: 'tab'+num.toString(),
          type: 'line',
          zoomType: 'xy',
          events: {
          load: function () {
            var series = this.series;
            setInterval(function () {
              if (!shiftOrNot && $rootScope.dict["Timestamp"].length > 30){
                shiftOrNot = true;
                console.log("turned shifting on");
              };
              var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                  y;
              for (var key in $rootScope.dict){
                if (parseInt(key)){
                  console.log("key: ");
                  console.log(key);
                  y = $rootScope.dict[key][$rootScope.dict[key].length - 1];
                  series[key].addPoint([x, y], true, shiftOrNot1);
                }
              };
              //series[0].addPoint([x, y], true, shiftOrNot);
              //y = $rootScope.dict["1"][$rootScope.dict["1"].length - 1];
              //series[1].addPoint([x, y], true, shiftOrNot);
              //y = $rootScope.dict["2"][$rootScope.dict["2"].length - 1];
              //series[2].addPoint([x, y], true, shiftOrNot);
              //y = $rootScope.dict["3"][$rootScope.dict["3"].length - 1];
              //series[3].addPoint([x, y], true, shiftOrNot);
              }, 1000);
            }
          }
          //animation: Highcharts.svg
          //width: x,
          //height: y
        },
        xAxis: {
          type : 'datetime',
          dateTimeLabelFormats: {
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y<br/>%m-%d',
            week: '%Y<br/>%m-%d',
            month: '%Y-%m',
            year: '%Y'
          },
          title: {
            text: "Time" 
          }
        },
        yAxis: {
          title: {
            text: "Voltage [V]"
          }
        },
        series:seriesVoltages, 
          //[
          //{'name': 'Cel0-voltage',
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['0'].slice(Math.max($rootScope.dict['0'].length - 30, 1))])},
          //{'name': 'Cel1-voltage',                                                  
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['1'].slice(Math.max($rootScope.dict['1'].length - 30, 1))])},
          //{'name': 'Cel2-voltage',                                                  
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['2'].slice(Math.max($rootScope.dict['2'].length - 30, 1))])},
          //{'name': 'Cel3-voltage',                                                  
          // 'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['3'].slice(Math.max($rootScope.dict['3'].length - 30, 1))])}
          //],
        title: {
            text: "Battery voltage stats"
        }
      })

    } else if (num == 3 && init3 == 0){
      init3 = 1;
      shiftOrNot3 = false;
      $rootScope.chart3Config = new Highcharts.Chart({
        chart: {
          renderTo: 'tab'+num.toString(),
          events: {
          load: function () {
            var series = this.series;
            setInterval(function () {
              if (!shiftOrNot3 && $rootScope.dict["Timestamp"].length > 30){
                shiftOrNot3 = true;
                console.log("turned shifting on");
              };
              var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                  y = $rootScope.dict["temp1"][$rootScope.dict["temp1"].length - 1];
              series[0].addPoint([x, y], true, shiftOrNot3);
              y = $rootScope.dict["temp2"][$rootScope.dict["temp2"].length - 1];
              series[1].addPoint([x, y], true, shiftOrNot3);
              y = $rootScope.dict["temp3"][$rootScope.dict["temp3"].length - 1];
              series[2].addPoint([x, y], true, shiftOrNot3);
              y = $rootScope.dict["temp4"][$rootScope.dict["temp4"].length - 1];
              series[3].addPoint([x, y], true, shiftOrNot3);
              }, 1000);
            }
          }
          //animation: Highcharts.svg
          //type: 'line',
          //zoomType: 'xy',
          //animation: true
          //width: x,
          //height: y
        },
        xAxis: {
          tickmarkPlacement: 'on',
          type: 'datetime',
          dateTimeLabelFormats: {
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y<br/>%m-%d',
            week: '%Y<br/>%m-%d',
            month: '%Y-%m',
            year: '%Y'
          },

          title: {
            text: "Time" 
          }
        },
        yAxis: {
          title: {
            text: "Temperature [°C]"
          }
        },
        series: [
          {'name': 'Cel0-temperature',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp1'].slice(Math.max($rootScope.dict['temp1'].length - 30, 1))])},
          {'name': 'Cel1-temperature',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp2'].slice(Math.max($rootScope.dict['temp2'].length - 30, 1))])},
          {'name': 'Cel2-temperature',                                              
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp3'].slice(Math.max($rootScope.dict['temp3'].length - 30, 1))])},
          {'name': 'Cel3-temperature',                                              
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['temp4'].slice(Math.max($rootScope.dict['temp4'].length - 30, 1))])}
          ],                                                                        
        title: { 
            text: "Battery temperature stats"
        },
        tooltip: {
          formatter: function(){
            return "Timestamp: " + Highcharts.numberFormat(this.x, 0) + " s <br\> " + this.series.name + ": " + Highcharts.numberFormat(this.y, 2) + " "
          }
        }
      })


    } else if (num == 4 && init4 == 0){
      init4 = 1;
      var shiftOrNot4 = false;
      $rootScope.chart4Config = new Highcharts.Chart({
        chart: {
          renderTo: 'tab'+num.toString(),
          events: {
          load: function () {
            var series = this.series;
            setInterval(function () {
              if (!shiftOrNot1 && $rootScope.dict["Timestamp"].length > 30){
                shiftOrNot1 = true;
                console.log("turned shifting on");
              };
              var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                  y = $rootScope.dict["Sl0Bl"][$rootScope.dict["Sl0Bl"].length - 1];
              series[0].addPoint([x, y], true, shiftOrNot1);
              y = $rootScope.dict["Sl1Bl"][$rootScope.dict["Sl1Bl"].length - 1];
              series[1].addPoint([x, y], true, shiftOrNot1);
              y = $rootScope.dict["Sl2Bl"][$rootScope.dict["Sl2Bl"].length - 1];
              series[2].addPoint([x, y], true, shiftOrNot1);
              y = $rootScope.dict["Sl3Bl"][$rootScope.dict["Sl3Bl"].length - 1];
              series[3].addPoint([x, y], true, shiftOrNot1);
              }, 1000);
            }
          }
          //animation: Highcharts.svg

          //type: 'line',
          //zoomType: 'xy',
          //animation: true
          //width: x,
          //height: y
        },
        xAxis: {
          tickmarkPlacement: 'on',
          type: 'datetime',
          dateTimeLabelFormats: {
            second: '%Y-%m-%d<br/>%H:%M:%S',
            minute: '%Y-%m-%d<br/>%H:%M',
            hour: '%Y-%m-%d<br/>%H:%M',
            day: '%Y<br/>%m-%d',
            week: '%Y<br/>%m-%d',
            month: '%Y-%m',
            year: '%Y'
          },

          title: {
            text: "Time" 
          }
        },
        yAxis: {
          title: {
            text: "Bleeding [1 = on, 0 = off]"
          }
        },
        series: [
          {'name': 'Cel0-bleeding',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl0Bl'].slice(Math.max($rootScope.dict['Sl0Bl'].length - 30, 1))]),
          'step': 'left'},
          {'name': 'Cel1-bleeding',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl1Bl'].slice(Math.max($rootScope.dict['Sl1Bl'].length - 30, 1))]),
          'step': 'left'},
          {'name': 'Cel2-bleeding',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl2Bl'].slice(Math.max($rootScope.dict['Sl2Bl'].length - 30, 1))]),
          'step': 'left'},
          {'name': 'Cel3-bleeding',
           'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict['Sl3Bl'].slice(Math.max($rootScope.dict['Sl3Bl'].length - 30, 1))]),
          'step': 'left'}
          ],
        title: {
            text: "Battery bleeding stats"
        },
        tooltip: {
          formatter: function(){
            return "Timestamp: " + Highcharts.numberFormat(this.x, 0) + " s <br\> " + this.series.name + ": " + Highcharts.numberFormat(this.y, 2) + " "
          }
        }
      })


    } else {
      "no function defined";
    };
  }); 
};

$scope.alertMe = function() {
  setTimeout(function() {
    $window.alert('You\'ve selected the alert tab!');
  });
};

$scope.model = {
  name: 'Tabs'
};
});

app.run(function($rootScope, $http, $timeout){
$rootScope.dict = {
    "Timestamp" : [],
    "Current" : [],
    "0" : [],
    "1" : [],
    "2" : [],
    "3" : [],
    "4" : [],
    "5" : [],
    "6" : [],
    "7" : [],
    "temp1"      : [],
    "temp2"      : [],
    "temp3"      : [],
    "temp4"      : [],
    "temp5"      : [],
    "temp6"      : [],
    "temp7"      : [],
    "temp8"      : [],
    "temp9"      : [],
    "Sl0Bl"  : [],
    "Sl1Bl"  : [],
    "Sl2Bl"  : [],
    "Sl3Bl"  : [],
    "Sl4Bl"  : [],
    "Sl5Bl"  : [],
    "Sl6Bl"  : [],
    "Sl7Bl"  : [],
    "Sl8Bl"  : []
  };
  $rootScope.stamp2date = function(timestamp){
    var date = new Date(timestamp*1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime
  }
  $rootScope.getData = function(){
    $http.get("http://"+location.hostname+":5000/ActualValues")
    .then(function(response) {
      console.log(response);
      if ($rootScope.dict['Timestamp'].length > 100){
        $rootScope.dict["Current"].shift();
        $rootScope.dict["Timestamp"].shift();
        $rootScope.dict["0"].shift();
        $rootScope.dict["1"].shift();
        $rootScope.dict["2"].shift();
        $rootScope.dict["3"].shift();
        $rootScope.dict["4"].shift();
        $rootScope.dict["5"].shift();
        $rootScope.dict["6"].shift();
        $rootScope.dict["7"].shift();
        //$rootScope.dict["temp1"].shift();
        //$rootScope.dict["temp2"].shift();
        //$rootScope.dict["temp3"].shift();
        //$rootScope.dict["temp4"].shift();
        $rootScope.dict["Sl0Bl"].shift();
        $rootScope.dict["Sl1Bl"].shift();
        $rootScope.dict["Sl2Bl"].shift();
        $rootScope.dict["Sl3Bl"].shift();
      }
      $rootScope.dict["Current"].push(parseFloat(response.data["Current"].toFixed(2)));
      $rootScope.dict["Timestamp"].push(parseFloat(response.data["Timestamp"]));
      $rootScope.dict["0"].push(parseFloat(response.data["MVoltage"].toFixed(5)));
      $rootScope.dict["1"].push(parseFloat(response.data["Sl1Voltage"].toFixed(5)));
      $rootScope.dict["2"].push(parseFloat(response.data["Sl2Voltage"].toFixed(5)));
      $rootScope.dict["3"].push(parseFloat(response.data["Sl3Voltage"].toFixed(5)));
      $rootScope.dict["4"].push(parseFloat(response.data["Sl4Voltage"].toFixed(5)));
      $rootScope.dict["5"].push(parseFloat(response.data["Sl5Voltage"].toFixed(5)));
      $rootScope.dict["6"].push(parseFloat(response.data["Sl6Voltage"].toFixed(5)));
      $rootScope.dict["7"].push(parseFloat(response.data["Sl7Voltage"].toFixed(5)));
      //$rootScope.dict["temp1"].push(parseFloat(response.data["temp1"].toFixed(2)));
      //$rootScope.dict["temp2"].push(parseFloat(response.data["temp2"].toFixed(2)));
      //$rootScope.dict["temp3"].push(parseFloat(response.data["temp3"].toFixed(2)));
      //$rootScope.dict["temp4"].push(parseFloat(response.data["temp4"].toFixed(2)));
      $rootScope.dict["Sl0Bl"].push(parseFloat(response.data["Sl0Bl"]));
      $rootScope.dict["Sl1Bl"].push(parseFloat(response.data["Sl1Bl"]));
      $rootScope.dict["Sl2Bl"].push(parseFloat(response.data["Sl2Bl"]));
      $rootScope.dict["Sl3Bl"].push(parseFloat(response.data["Sl3Bl"]));
      $rootScope.dict["Sl4Bl"].push(parseFloat(response.data["Sl4Bl"]));
      $rootScope.dict["Sl5Bl"].push(parseFloat(response.data["Sl5Bl"]));
      $rootScope.dict["Sl6Bl"].push(parseFloat(response.data["Sl6Bl"]));
      $rootScope.dict["Sl7Bl"].push(parseFloat(response.data["Sl7Bl"]));
    //$rootScope.dict["Sl4Voltage"] = response.data["Sl4Voltage"].toFixed(5));
    //$rootScope.dict["Sl5Voltage"] = response.data["Sl5Voltage"].toFixed(5);
    //$rootScope.dict["Sl6Voltage"] = response.data["Sl6Voltage"].toFixed(5);
    //$rootScope.dict["Sl7Voltage"] = response.data["Sl7Voltage"].toFixed(5);
    });
  };
  $rootScope.intervalFunction = function(){
    $timeout(function(){
      $rootScope.getData();
      $rootScope.intervalFunction();
    }, 1000)
  };
  $rootScope.intervalFunction();

});

app.directive('draw', function($rootScope){
  return {
    restrict: 'A',
    scope: true,
    link: function postLink(scope, element, attrs){
      function test(element){
        var canvas = newCanvas(element);
        var nestedcanvas = canvas.nested();
        var bat1 = addBat(canvas);
        batbbox = bat1.bbox()
        bat1.viewbox(-5, -12, batbbox.width, batbbox.height + 30)
        var divel = canvas.parent().id;
        var text = nestedcanvas.text("");
        var tspan1 = text.tspan("")
        tspan1.clear()
        tspan1.text(function(add) {
          add.tspan("         ")
          add.tspan(function(addMore) {
              addMore.tspan("       ").newLine()
          })
        })
        text.font({
          family: 'Computer Modern',
          anchor: 'middle',
          size: 16 
        })
        textbbox = text.bbox()
        nestedcanvas.viewbox(-62, -40, 120, 120);
        $rootScope.$watch('dict["'+(divel - 1).toString()+'"][dict["'+(divel - 1).toString()+'"].length - 1]', function(newVal, oldVal){
          //console.log($rootScope.dict);
          //console.log("Sl" + divel.toString() +"Bl");
          //console.log($rootScope.dict["Sl" + divel.toString() +"Bl"]);
          tspan1.clear()
          tspan1.text(function(add) {
            if (!newVal){
              newVal = "  ";
              add.tspan(newVal.toString())
            } else {
              add.tspan(newVal.toString()+' V')
              add.tspan(function(addMore) {
                addMore.tspan("Bl: " + $rootScope.dict["Sl" + (divel - 1).toString() +"Bl"][$rootScope.dict["Sl" + (divel - 1).toString() +"Bl"].length - 1]).newLine()
                addMore.tspan(function(addEvenMore) {
                  addEvenMore.tspan($rootScope.dict["temp"+divel.toString()][$rootScope.dict["temp"+divel.toString()].length - 1] + "°C").newLine()
                })
              })
            }
          })
        });
      }
    test(element[0]);
    }
  };
});

app.controller('AlertDemoCtrl', function ($scope) {
  $scope.alerts = [
  ];
  $scope.addAlert = function() {
    $scope.alerts.push({msg: 'Another test!'});
  };
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
});
