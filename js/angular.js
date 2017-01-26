//bat_plot.js should be loaded for this javascript to work
//
//
var app = angular.module('myApp', ["ngRoute", 'ui.bootstrap']);

   
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
    templateUrl: "../statistics.html"
  });
});

app.controller('myCtrl', function($scope, $rootScope, $http, $timeout) {
});

app.controller('mainCtrl', function($scope, $location) {
  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };
});

app.controller("mapCtrl", function($scope){
});
app.controller("statCtrl", function($scope){
});

app.run(function($rootScope, $http, $timeout){
  $rootScope.dict = {
    "Timestamp" : -1,
    "Current" : -1,
    "MVoltage" : -1,
    "Sl1Voltage" : -1,
    "Sl2Voltage" : -1,
    "Sl3Voltage" : -1,
    "Sl4Voltage" : -1,
    "Sl5Voltage" : -1,
    "Sl6Voltage" : -1,
    "Sl7Voltage" : -1,
    "temp1"      : " ",
    "temp2"      : " ",
    "temp3"      : " ",
    "temp4"      : " ",
    "temp5"      : " ",
    "temp6"      : " ",
    "temp7"      : " ",
    "temp8"      : " ",
    "temp9"      : " "
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
      $rootScope.dict = response.data;
      $rootScope.dict["Current"] = response.data["Current"].toFixed(2);
      $rootScope.dict["Timestamp"] = $rootScope.stamp2date(response.data["Timestamp"]);
      $rootScope.dict["1"] = response.data["MVoltage"].toFixed(5);
      $rootScope.dict["2"] = response.data["Sl1Voltage"].toFixed(5);
      $rootScope.dict["3"] = response.data["Sl3Voltage"].toFixed(5);
      $rootScope.dict["4"] = response.data["Sl2Voltage"].toFixed(5);
      $rootScope.dict["temp1"] = response.data["temp1"].toFixed(2);
      $rootScope.dict["temp2"] = response.data["temp2"].toFixed(2);
      $rootScope.dict["temp3"] = response.data["temp3"].toFixed(2);
      $rootScope.dict["temp4"] = response.data["temp4"].toFixed(2);
      //$rootScope.dict["Sl4Voltage"] = response.data["Sl4Voltage"].toFixed(5);
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
        $rootScope.$watch('dict["'+divel.toString()+'"]', function(newVal, oldVal){
          tspan1.clear()
          tspan1.text(function(add) {
            if (!newVal){
              newVal = "  ";
              add.tspan(newVal.toString())
            } else {
              add.tspan(newVal.toString()+' V')
              add.tspan(function(addMore) {
                addMore.tspan(" ").newLine()
                addMore.tspan(function(addEvenMore) {
                  addEvenMore.tspan($rootScope.dict["temp"+divel.toString()] + "°C").newLine()
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
