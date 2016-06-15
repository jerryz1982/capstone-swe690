import datetime  
import json  
import paho.mqtt.client  
import time  
import RPi.GPIO as GPIO

sleepTime = 10 
# MQTT details  
mqttDeviceId = "Raspberry-Pi:Prototype" 
mqttBrokerHost = "hyena.rmq.cloudamqp.com"  
mqttBrokerPort = 1883  
mqttUser = "dfwxdeyo"  
mqttPassword = "GTFbKpT7scn2nXgrWrtzfRLaniD0wfMr"  
mqttVhost = "dfwxdeyo"
mqttTelemetryTopic = "RPi.Data"  
mqttControlTopic = "RPi.Control"
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)
GPIO.setup(4, GPIO.IN)


# Callback methods  
def on_connect(client, userdata, flags, rc):  
    if rc == 0:  
          print("Connected to MQTT broker (RC: %s)" % rc)  
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
    print("Received message " + str(message.payload) + " on topic " + message.topic)
    alarm = json.loads(message.payload)["alarm_on"]
    if alarm == "False":
        print("Turn off alarm")
        GPIO.output(17, False)

mqttClient = paho.mqtt.client.Client()  
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
# Collect telemetry information from Sense HAT and publish to MQTT broker in JSON format  
mqttClient.subscribe(mqttControlTopic, 1)
while True:
  if GPIO.input(4):
    GPIO.output(17, True)
    telemetryData = {}
    telemetryData["DeviceId"] = mqttDeviceId  
    telemetryData["Timestamp"] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]  
    telemetryData["Motion"] = "True"
    telemetryDataJson = json.dumps(telemetryData)  
    mqttClient.publish(mqttTelemetryTopic, telemetryDataJson, 1) 
    time.sleep(sleepTime)  
mqttClient.loop_stop()  
mqttClient.disconnect()  
