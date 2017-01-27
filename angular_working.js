//bat_plot.js should be loaded for this javascript to work
//
//
var app = angular.module('myApp', ["ngRoute", "highcharts-ng"]);

 
  app.config(function($routeProvider) {
    //$locationProvider.hashPrefix(''); //http://stackoverflow.com/questions/41214312/exclamation-mark-after-hash-in-angularjs-app/41551864#41551864
    $routeProvider
    .when("/", {
      templateUrl: "../test.html",
      controller: "myCtrl"
    })
    .when("/statistics", {
      templateUrl: "../statistics.html"
      controller: "statCtrl"
    });
  });

  app.controller("statCtrl", function($scope, $rootScope){
    $scope.chart1Config = {
      chart: {
        type: 'line',
        zoomType: 'xy',
        animation: false
      },
      xAxis: {
        categories: $rootScope["Timestamp"],
        tickmarkPlacement: 'on',
        title: {
         text: "Time [timestamp]" 
        }
      },
      yAxis: {
        title: {
          text: "Voltage [V]"
        }
      },
      series: [{
        name : "Sl1Voltage",
        data : $rootScope["Sl1Voltage"]
      }
      tooltip: {
        formatter: function(){
          return "Time: " +this.x + " s <br\> " + this.series.name + ": " + this.y + " V"
        }
      }
    }
  });

  app.run(function($rootScope){
    $rootScope.dict = {
      "Timestamp" : new Array(),
      "Current" : new Array(),
      "MVoltage" : new Array(),
      "Sl1Voltage" : new Array(),
      "Sl2Voltage" : new Array(),
      "Sl3Voltage" : new Array(),
      "Sl4Voltage" : new Array(),
      "Sl5Voltage" : new Array(),
      "Sl6Voltage" : new Array(),
      "Sl7Voltage" : new Array(),
      "temp1"      : new Array(),
      "temp2"      : new Array(),
      "temp3"      : new Array(),
      "temp4"      : new Array(),
      "temp5"      : new Array(),
      "temp6"      : new Array(),
      "temp7"      : new Array(),
      "temp8"      : new Array(),
      "temp9"      : new Array(),
      "MBl"  : new Array(),
      "Sl1Bl"  : new Array(),
      "Sl2Bl"  : new Array(),
      "Sl3Bl"  : new Array(),
      "Sl4Bl"  : new Array(),
      "Sl5Bl"  : new Array(),
      "Sl6Bl"  : new Array(),
      "Sl7Bl"  : new Array(),
      "Sl8Bl"  : new Array(),
      "Sl9Bl"  : new Array()
    };
  });
  
  app.controller('myCtrl', function($scope, $rootScope, $http, $timeout) {
    $scope.stamp2date = function(timestamp){
      var date = new Date(timestamp*1000);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
      return formattedTime
    }
    $scope.getData = function(){
      console.log(location.hostname)
      $http.get("http://"+location.hostname+":5000/ActualValues")
      .then(function(response) {
        if($rootScope.dict["Current"].push(response.data["Current"].toFixed(2)) > 1000){
          $rootScope.dict["Current"].shift();
        }
        if($rootScope.dict["Timestamp"].push($scope.stamp2date(response.data["Timestamp"])) > 1000){
          $rootScope.dict["Timestamp"].shift();
        }
        if($rootScope.dict["1"].push(response.data["MVoltage"].toFixed(5)) > 1000){
          $rootScope.dict["1"].shift();
        }
        if($rootScope.dict["2"].push(response.data["Sl1Voltage"].toFixed(5)) > 1000){
          $rootScope.dict["2"].shift();
        }
        if($rootScope.dict["3"].push(response.data["Sl3Voltage"].toFixed(5)) > 1000){
          $rootScope.dict["3"].shift();
        }
        if($rootScope.dict["4"].push(response.data["Sl2Voltage"].toFixed(5)) > 1000){
          $rootScope.dict["4"].shift();
        }
        if($rootScope.dict["temp1"].push(response.data["temp1"].toFixed(2)) > 1000){
          $rootScope.dict["temp1"].shift();
        }
        if($rootScope.dict["temp2"].push(response.data["temp2"].toFixed(2)) > 1000){
          $rootScope.dict["temp2"].shift();
        }
        if($rootScope.dict["temp3"].push(response.data["temp3"].toFixed(2)) > 1000){
          $rootScope.dict["temp3"].shift();
        }
        if($rootScope.dict["temp4"].push(response.data["temp4"].toFixed(2)) > 1000){
          $rootScope.dict["temp4"].shift();
        }
        if($rootScope.dict["MBl"].push(response.data["Mbl"]) > 1000){
          $rootScope.dict["MBl"].shift();
        }
        if($rootScope.dict["Sl1Bl"].push(response.data["Sl1Bl"]) > 1000){
          $rootScope.dict["Sl1Bl"].shift();
        }
        if($rootScope.dict["Sl2Bl"].push(response.data["Sl2Bl"]) > 1000){
          $rootScope.dict["Sl2Bl"].shift();
        }
        if($rootScope.dict["Sl3Bl"].push(response.data["Sl3Bl"]) > 1000){
          $rootScope.dict["Sl3Bl"].shift();
        }
        //$rootScope.dict["Sl4Voltage"].push(response.data["Sl4Voltage"].toFixed(5) > 1000){
        //$rootScope.dict["Sl5Voltage"] = response.data["Sl5Voltage"].toFixed(5) > 1000){
        //$rootScope.dict["Sl6Voltage"] = response.data["Sl6Voltage"].toFixed(5);
        //$rootScope.dict["Sl7Voltage"] = response.data["Sl7Voltage"].toFixed(5);
      });
    };
    $scope.intervalFunction = function(){
      $timeout(function(){
        $scope.getData();
        $scope.intervalFunction();
      }, 1000)
    };
    $scope.intervalFunction();
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
          nestedcanvas.viewbox(-64, -40, 120, 120);
          scope.$root.$watch('dict["'+divel.toString()+'"]', function(newVal, oldVal){
            tspan1.clear()
            tspan1.text(function(add) {
              if (!newVal){
                newVal = "  ";
                add.tspan(newVal.toString())
              } else {
                console.log("newVal");
                add.tspan(newVal.toString()+' V')
                add.tspan(function(addMore) {
                  addMore.tspan(" ").newLine()
                  addMore.tspan(function(addEvenMore) {
                    addEvenMore.tspan(scope.$root.dict["temp"+divel.toString()] + "°C").newLine()
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
 
