(function() {
  var app = angular.module('piguard', []);
  app.controller('AgentsController', ['$scope', '$http', function($scope, $http) {
    var api_url = 'http://127.0.0.1:8000'
    var agents = this;
    var config = {
      headers : {
          'Content-Type': 'application/json'
      }
    }
    agents.alarms = {}
    $scope.arm = function(deviceid, on) {
      var json_data = {
        alarm_on: on
      }
      $http.put( api_url + '/agents/' + deviceid, json_data, config).success(function() {
        $scope.getAgents()
      });
    }
    $scope.getAgents = function() {
      $http.get( api_url + '/agents').success(function(agents_data) {
        agents.items = agents_data;
      });
    }
    $scope.getAlarms = function(deviceid) {
      $http.get( api_url + '/alarms?deviceid=' + deviceid).success(function(alarms_data) {
        agents.alarms[deviceid] = alarms_data
    });
    }

    $scope.ack_alarm = function(deviceid, alarmid) {
      var alarm_data = {
        'state': 'acknowledged'
      }
      $http.put( api_url + '/alarms/' + alarmid, alarm_data, config).success(function() {
        $scope.getAlarms(deviceid)
      });
    }

    $scope.del_alarm = function(deviceid, alarmid) {
      $http.delete( api_url + '/alarms/' + alarmid, config).success(function() {
        $scope.getAlarms(deviceid)
      });
    }

    $scope.getAgents()
  }]);

})();
