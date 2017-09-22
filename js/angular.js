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

app.controller("statCtrl", function($scope, $rootScope, $interval){
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
        var shiftOrNot = false;
        seriesList = [];
        for (var key in $rootScope.dict){
          if (key != "Timestamp" && ($rootScope.dict[key] || $rootScope.dict[key] == 0)){
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
              $interval(function () {
                if (!shiftOrNot && $rootScope.dict["Timestamp"].length > 30){
                  shiftOrNot = true;
                  console.log("turned shifting on");
                };
                var i = 0;
                var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                    y;
                for (var key in $rootScope.dict){
                  if (key != "Timestamp"){
                    var y = $rootScope.dict[key][$rootScope.dict[key].length - 1];
                    series[i].addPoint([x, y], true, shiftOrNot);
                    i = i + 1;
                  }
                };
                }, 1000);
              }
            }
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
          title: {
              text: "Battery all stats"
          }
        })
      } else if (num == 2 && init2 == 0){
        init2 = 1;
        var shiftOrNot = false;
        var voltageList = [];
        for (var key in $rootScope.dict){
          if (key.indexOf("Voltage") > -1 && ($rootScope.dict[key] || $rootScope.dict[key] == 0)){
            voltageList.push({'name': key,
               'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict[key].slice(Math.max($rootScope.dict[key].length - 30, 1))])})
          }
        }
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
                var i = 0;
                var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                    y;
                for (var key in $rootScope.dict){
                  if (key.indexOf("Voltage") > -1){
                    var y = $rootScope.dict[key][$rootScope.dict[key].length - 1];
                    series[i].addPoint([x, y], true, shiftOrNot);
                    i = i + 1;
                  }
                };
                }, 1000);
              }
            }
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
          series:voltageList, 
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
        var blList = [];
        for (var key in $rootScope.dict){
          if (key.indexOf("Bl") > -1 && ($rootScope.dict[key] || $rootScope.dict[key] == 0)){
            blList.push({'name': key,
               'data': zip([$rootScope.dict["Timestamp"].slice(Math.max($rootScope.dict["Timestamp"].length - 30, 1)).map(function(x){return x*1000}), $rootScope.dict[key].slice(Math.max($rootScope.dict[key].length - 30, 1))])})
          }
        }

        $rootScope.chart4Config = new Highcharts.Chart({
          chart: {
            renderTo: 'tab'+num.toString(),
            events: {
            load: function () {
              var series = this.series;
              setInterval(function () {
                if (!shiftOrNot && $rootScope.dict["Timestamp"].length > 30){
                  shiftOrNot = true;
                };
                var i = 0;
                var x = $rootScope.dict["Timestamp"][$rootScope.dict["Timestamp"].length - 1]*1000,
                    y;
                for (var key in $rootScope.dict){
                  if (key.indexOf("Bl") > -1){
                    var y = $rootScope.dict[key][$rootScope.dict[key].length - 1];
                    series[i].addPoint([x, y], true, shiftOrNot);
                    i = i + 1;
                  }
                };
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
          series: blList,
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
  $http.get("http://"+location.hostname+":5000/ActualValues")
  .then(function(response) {
    $rootScope.dict = {}
    for (var key in response.data){
      $rootScope.dict[key] = [];
    }
    console.log($rootScope.dict);
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
      if ($rootScope.dict['Timestamp'].length > 50){
        for (key in $rootScope.dict){
          $rootScope.dict[key].shift();
        };
      }
      for (var key in response.data){
        if (key == "Timestamp"){
          $rootScope.dict[key].push(parseFloat(response.data[key]));
        } else if (key == "Current") {
          $rootScope.dict[key].push(parseFloat(response.data[key].toFixed(2)));
        } else {
          $rootScope.dict[key].push(parseFloat(response.data[key].toFixed(5)));
        }
      }
    })
  };
  $rootScope.intervalFunction = function(){
    $timeout(function(){
      $rootScope.getData();
      $rootScope.intervalFunction();
    }, 1000)
  };
  $rootScope.intervalFunction();
  });
});

app.directive('draw', function($rootScope, $http){
  mapping = {};
  storedValues = [];
  count = 0;
  for (var key in $rootScope.dict){
    if (key != "Timestamp" && key != "Current"){
      if (storedValues.indexOf(key.match(/\d+/)[0]) == -1){
        mapping[count] = key.match(/\d+/)[0];
        storedValues.push(key.match(/\d+/)[0]);
        count = count + 1;
      }
    }
  }
  //$http.get("http://"+location.hostname+":5000/ActualValues")
  //  .then(function(response) {
  //    for (var key in response.data){
  //      $rootScope.dict2[key] = [];
  //    }
  //  count = 0;
  //  storedValues = [];
  //  for (var key in $rootScope.dict2){
  //    if (key != "Timestamp" && key != "Current"){
  //      console.log(key);
  //      if (storedValues.indexOf(key.match(/\d+/)[0]) == -1){
  //        mapping[count] = key.match(/\d+/)[0];
  //        storedValues.push(key.match(/\d+/)[0]);
  //        count = count + 1;
  //      }
  //    }
  //  }
  //  console.log($rootScope.dict2);
  //  console.log(mapping);
  //})
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
        $rootScope.$watch('dict["Sl'+mapping[(divel - 1)].toString()+'Voltage"][dict["Sl'+mapping[(divel - 1).toString()]+'Voltage"].length - 1]', function(newVal, oldVal){
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
                addMore.tspan("Bl: " + $rootScope.dict["Sl" + mapping[(divel - 1)].toString() +"Bl"][$rootScope.dict["Sl" + mapping[(divel - 1)].toString() +"Bl"].length - 1]).newLine()
                addMore.tspan(function(addEvenMore) {
                  if ("temp"+divel.toString() in $rootScope.dict){
                    addEvenMore.tspan($rootScope.dict["temp"+divel.toString()][$rootScope.dict["temp"+divel.toString()].length - 1] + "°C").newLine()
                  } else {
                    addEvenMore.tspan("No T-sensor").newLine()
                  }
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
