(function() {
  var app = angular.module('piguard', []);
  app.controller('AgentsController', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    var api_url = 'https://piguard-manager.herokuapp.com/api';
    //var api_url = 'http://127.0.0.1:8000/api'
    var agents = this;
    var config = {
      headers : {
          'Content-Type': 'application/json'
      }
    }
    agents.alarms = {}
    agents.color = {}
    agents.state = {}
    agents.expanded = {}
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
        agents_data.forEach(function(agent) {
          $scope.getAgentcolor(agent.deviceid)
        })
        agents.items = agents_data;
      });
    }

    $scope.getAgentcolor = function(deviceid) {
      $http.get( api_url + '/agents/' + deviceid ).success(function(agent_data) {
        if (agent_data.alarm_count>0 && agent_data.alarm_count<10) {
           agents.color[deviceid] = "orange"
        }
        if (agent_data.alarm_count==0) {
           agents.color[deviceid] = "green"
        }
        if (agent_data.alarm_count>=10) {
           agents.color[deviceid] = "red"
        }
        if (agent_data.state == "online") {
           agents.state[deviceid] = "led-green"
        }
        if (agent_data.state == "offline") {
           agents.state[deviceid] = "led-gray"
        }
      })
    }

    $scope.getAlarms = function(deviceid) {
      $http.get( api_url + '/alarms?deviceid=' + deviceid).success(function(alarms_data) {
        agents.alarms[deviceid] = alarms_data
    });
    }

    $scope.set_alarm = function(deviceid, alarmid, state) {
      var alarm_data = {
        'state': state
      }
      $http.put( api_url + '/alarms/' + alarmid, alarm_data, config).success(function() {
        $scope.getAlarms(deviceid)
      });
    }

    $scope.del_alarm = function(alarm) {
      $http.delete( api_url + '/alarms/' + alarm._id, config).success(function() {
        $scope.getAlarms(alarm.deviceid)
      });
    }

    $scope.getAgents()
    $interval(function() {
      $scope.getAgents()
    }, 5000);
  }]);

})();
