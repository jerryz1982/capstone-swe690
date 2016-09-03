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

    $http.get( api_url + '/agents').success(function(agents_data) {
      agents_data.forEach(function(agent) {
        agents[agent.deviceid] = {}
        agents[agent.deviceid].expanded = false
        $scope.getAgentcolor(agent.deviceid)
      })
      agents.items = agents_data;
    });

    $scope.arm = function(deviceid, on) {
      var json_data = {
        alarm_on: on
      }
      $http.put( api_url + '/agents/' + deviceid, json_data, config).success(function() {
        $scope.getAgents()
      });
    }

    $scope.reboot = function(deviceid) {
      var json_data = {
        reboot: true
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
        agents[deviceid]['alarm_count'] = agent_data.alarm_count
        if (agent_data.alarm_count>0 && agent_data.alarm_count<10) {
           agents[deviceid]['color'] = "orange"
        }
        if (agent_data.alarm_count==0) {
           agents[deviceid]['color'] = "green"
        }
        if (agent_data.alarm_count>=10) {
           agents[deviceid]['color'] = "red"
        }
        if (agent_data.state == "online") {
           agents[deviceid].state = "led-green"
        }
        if (agent_data.state == "offline") {
           agents[deviceid].state = "led-gray"
        }
      })
    }

    $scope.getAlarms = function(deviceid) {
      $http.get( api_url + '/alarms?deviceid=' + deviceid).success(function(alarms_data) {
        agents[deviceid].alarms = alarms_data
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

    $interval(function() {
      $scope.getAgents()
    }, 5000);
  }]);

})();
