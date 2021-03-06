import datetime  
import json  
import paho.mqtt.client  
import time  
#import RPi.GPIO as GPIO

from piguard.common import config

cfg = config.PiguardConfig()

sleepTime = 5
# MQTT details  
mqttDeviceId = cfg.mqtt_device_id
mqttBrokerHost = cfg.mqtt_broker_host
mqttBrokerPort = cfg.mqtt_broker_port
mqttUser = cfg.mqtt_user
mqttPassword = cfg.mqtt_password
mqttVhost = cfg.mqtt_vhost
mqttTelemetryTopic = "RPi.Data"  
mqttControlTopic = "RPi.Control"
mqttRegisterTopic = "RPi.Register"
mqttConfigTopic = "RPi.Config"
#GPIO.setmode(GPIO.BCM)
#GPIO.setup(17, GPIO.OUT)
#GPIO.setup(4, GPIO.IN)


# Callback methods  
def on_connect(client, userdata, flags, rc):  
    if rc == 0:
          print("Connected to MQTT broker (RC: %s)" % rc)
          mqttClient.subscribe(mqttControlTopic, 1)
          mqttClient.subscribe(mqttConfigTopic, 1)
    else:  
          print("Connection to MQTT broker failed (RC: %s)" % rc)   
def on_log(client, userdata, level, buf):  
    print(buf)  
def on_publish(client, userdata, mid):  
    print("Data published (Mid: %s)" % mid)  
def on_disconnect(client, userdata, rc):  
    if rc != 0:  
          print("Unexpected disconnect")  
    print("Disconnected from MQTT broker")  
def on_subscribe(client, userdata, mid, granted_qos):
    print("Subscribed on topic")
def on_message(client, userdata, message):
    print("Received message " + message.payload + " on topic " + message.topic)
    if message.topic == "RPi/Control":
      alarm = json.loads(message.payload)["alarm_on"]
      if alarm == "False":
        print("Turn off alarm")
        #GPIO.output(17, False)
    elif message.topic == "RPi/Config":
      print(json.loads(message.payload)["message"])

mqttClient = paho.mqtt.client.Client(clean_session=True) 
mqttClient.username_pw_set(mqttVhost + ":" + mqttUser, mqttPassword)  
#mqttClient.username_pw_set(mqttUser, mqttPassword)
# Register callbacks  
mqttClient.on_connect = on_connect  
mqttClient.on_log = on_log  
mqttClient.on_publish = on_publish  
mqttClient.on_disconnnect = on_disconnect  
mqttClient.on_message = on_message
# Connect to MQTT broker  
mqttClient.connect(mqttBrokerHost, mqttBrokerPort, 60)  
mqttClient.loop_start()  
# subscribe to control topic for control signals
mqttClient.subscribe(mqttControlTopic, 1)
# register when start
registryData = {}
registryData["DeviceId"] = mqttDeviceId

import netifaces
import netifaces
default_gw_intf = netifaces.gateways()["default"][netifaces.AF_INET][1]
default_gw_intf_ip = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_INET][0]["addr"]
registryData["IPAddr"] = default_gw_intf_ip
mac_address = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_LINK][0]["addr"]
registryData["MacAddr"] = mac_address
registryDataJson = json.dumps(registryData)

def main_loop():
  while True:
      mqttClient.publish(mqttRegisterTopic, registryDataJson, 0)
#  if GPIO.input(4):
#    GPIO.output(17, True)
      telemetryData = {}
      telemetryData["DeviceId"] = mqttDeviceId  
      telemetryData["Timestamp"] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]  
      telemetryData["Motion"] = "True"
      telemetryDataJson = json.dumps(telemetryData)  
      #mqttClient.publish(mqttTelemetryTopic, telemetryDataJson, 1) 
      time.sleep(sleepTime)


if __name__ == '__main__':
    try:
        main_loop()
    except KeyboardInterrupt:
        print("exiting by keyboard interrupt")
        mqttClient.loop_stop()
        mqttClient.disconnect()
