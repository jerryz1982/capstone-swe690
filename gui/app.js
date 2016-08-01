(function() {
  var app = angular.module('piguard', []);
  app.controller('AgentsController', ['$scope', '$http', function($scope, $http) {
    var agents = this;
    agents.alarms = {}
    $scope.arm = function(deviceid, on) {
      var json_data = {
        alarm_on: on
      }
      var config = {
        headers : {
            'Content-Type': 'application/json'
        }
      }
      $http.put('http://127.0.0.1:8000/agents/' + deviceid, json_data, config).success(function() {
        $scope.getAgents()
      });
    }
    $scope.getAgents = function() {
      $http.get('http://127.0.0.1:8000/agents').success(function(agents_data) {
        agents.items = agents_data;
      });
    }
    $scope.getAlarms = function(deviceid) {
      $http.get('http://127.0.0.1:8000/alarms?deviceid=' + deviceid).success(function(alarms_data) {
        agents.alarms[deviceid] = alarms_data
    });
    }
    $scope.getAgents()
  }]);

})();
