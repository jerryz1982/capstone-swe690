import datetime  
import json  
import paho.mqtt.client  
import time  

from piguard.common import config

cfg = config.PiguardConfig()

sleepTime = 30 
# MQTT details  
mqttDeviceId = cfg.mqtt_device_id
mqttBrokerHost = cfg.mqtt_broker_host
mqttBrokerPort = cfg.mqtt_broker_port
mqttUser = cfg.mqtt_user
mqttPassword = cfg.mqtt_password
mqttVhost = cfg.mqtt_vhost
mqttTelemetryTopic = "RPi.Data"
mqttControlTopic = "RPi.Control"
# Callback methods  
def on_connect(client, userdata, flags, rc):  
    if rc == 0:  
          print("Connected to MQTT broker (RC: %s)" % rc)  
    else:  
          print("Connection to MQTT broker failed (RC: %s)" % rc)   
def on_log(client, userdata, level, buf):  
    print(buf)  
def on_subscribe(client, userdata, mid, granted_qos):
    print("Topic subscribed (Mid: %s)" % mid)  
def on_disconnect(client, userdata, rc):  
    if rc != 0:  
          print("Unexpected disconnect")  
    print("Disconnected from MQTT broker")  
def on_message(client, userdata, message):
    print("Receveived message" + str(message.payload) + "on topic" + message.topic)
    motion = json.loads(message.payload)['Motion']
    if motion == "True":
        controlData = {}
        controlData["alarm_on"] = raw_input('leave alarm on? True/False')
        controlDataJson = json.dumps(controlData)
        mqttClient.publish(mqttControlTopic, controlDataJson, 1)
mqttClient = paho.mqtt.client.Client()  
mqttClient.username_pw_set(mqttVhost + ":" + mqttUser, mqttPassword)
#mqttClient.username_pw_set(mqttUser, mqttPassword)
# Register callbacks  
mqttClient.on_connect = on_connect
mqttClient.on_log = on_log  
mqttClient.on_subscribe = on_subscribe  
mqttClient.on_disconnnect = on_disconnect
mqttClient.on_message = on_message
# Connect to MQTT broker  
mqttClient.connect(mqttBrokerHost, mqttBrokerPort, 60)  
mqttClient.loop_start()  
# Collect telemetry information from Sense HAT and publish to MQTT broker in JSON format  
while True:
    mqttClient.subscribe(mqttTelemetryTopic, 1) 
    time.sleep(sleepTime)
mqttClient.loop_stop()  
mqttClient.disconnect()  
