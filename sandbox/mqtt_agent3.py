import datetime  
import json  
import paho.mqtt.client  
import time  
import RPi.GPIO as GPIO
import tweepy
from picamera import PiCamera
import os

sleepTime = 3
#enter the corresponding information from your Twitter application:
CONSUMER_KEY = 'pEqk36xG4exYbEse25SSIUJcv'#keep the quotes, replace this with your consumer key
CONSUMER_SECRET = 'L9IVMD5rb5R9aJXKd4puV8sC9UupbNP2eOoPEv0B7KDxa5YUhJ'#keep the quotes, replace this with your consumer secret key
ACCESS_KEY = '740591748968153089-0G04ug1TVd9OPjZn6d9C85Q7HJFntME'#keep the quotes, replace this with your access token
ACCESS_SECRET = 'fqC2YW55dHJYglWJWdoJBMBr5Omtv7kY5fKMIv5y2yokJ'#keep the quotes, replace this with your access token secret
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
api = tweepy.API(auth)
camera = PiCamera()

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
    alarm = json.loads(message.payload)["alarm_on"].lower()
    if alarm == "false":
        print("Alarm off")
        GPIO.remove_event_detect(4)
        GPIO.output(17, False)
    elif alarm == "true":
        print("Alarm on")
        try:
            GPIO.add_event_detect(4, GPIO.RISING)
            GPIO.add_event_callback(4, alarm_callback)
        except RuntimeError:
            print("alarm is already on")
    else:
        print("invalid input")

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


def alarm_callback(deviceid=mqttDeviceId):
    timestamp = time.strftime("%y%m%d_%H%M%S")
    filename = "".join(["/tmp/pic", timestamp, ".jpg"])
    camera.capture(filename)
    message = "Motion Detected at " + timestamp
    api.update_with_media(filename, status=message + " @xyzjerry #motion5493")
    os.remove(filename)

    telemetryData = {}
    telemetryData["DeviceId"] = deviceid
#    telemetryData["Timestamp"] = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    telemetryData["Timestamp"] = timestamp
    telemetryData["Motion"] = "True"
    telemetryDataJson = json.dumps(telemetryData)  
    mqttClient.publish(mqttTelemetryTopic, telemetryDataJson, 1) 
    GPIO.output(17, True)

def main_loop(sleep=sleepTime):
    # set initial event detect
    GPIO.add_event_detect(4, GPIO.RISING)
    GPIO.add_event_callback(4, alarm_callback)
    while True:
        time.sleep(sleep)

if __name__ == '__main__':
    try:
        main_loop()
    except KeyboardInterrupt:
        print("exiting by keyboard interrupt")
        mqttClient.loop_stop()
        mqttClient.disconnect()
