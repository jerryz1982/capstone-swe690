import datetime  
import json  
import paho.mqtt.client  
import time  
import RPi.GPIO as GPIO
import tweepy
from picamera import PiCamera
from picamera import exc as cam_exception
import os

from tweepy.error import TweepError

sleepTime = 10
deviceid = "Raspberry-Pi:Prototype"

class AgentConfig(object):
    def __init__(self):
        self.twitter_handles = ""
        self.hashtags = ""

config = AgentConfig()

#enter the corresponding information from your Twitter application:
CONSUMER_KEY = 'pEqk36xG4exYbEse25SSIUJcv'#keep the quotes, replace this with your consumer key
CONSUMER_SECRET = 'L9IVMD5rb5R9aJXKd4puV8sC9UupbNP2eOoPEv0B7KDxa5YUhJ'#keep the quotes, replace this with your consumer secret key
ACCESS_KEY = '740591748968153089-0G04ug1TVd9OPjZn6d9C85Q7HJFntME'#keep the quotes, replace this with your access token
ACCESS_SECRET = 'fqC2YW55dHJYglWJWdoJBMBr5Omtv7kY5fKMIv5y2yokJ'#keep the quotes, replace this with your access token secret
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
api = tweepy.API(auth)


def init_camera():
    try:
        global camera
        camera = PiCamera()
    except cam_exception.PiCameraError:
        print("camera not enabled")



# MQTT details  
mqttDeviceId = deviceid 
mqttBrokerHost = "hyena.rmq.cloudamqp.com"  
mqttBrokerPort = 1883
mqttUser = "dfwxdeyo"  
mqttPassword = "GTFbKpT7scn2nXgrWrtzfRLaniD0wfMr"  
mqttVhost = "dfwxdeyo"
mqttTelemetryTopic = "RPi.Data"
mqttControlTopic = "RPi.Control"
mqttRegisterTopic = "RPi.Register"
mqttConfigTopic = "RPi.Config"

# GPIO pins
door_pin = 27
pir_pin = 4
alert_pin = 17

GPIO.setmode(GPIO.BCM)
GPIO.setup(alert_pin, GPIO.OUT)
GPIO.setup(pir_pin, GPIO.IN)
GPIO.setup(door_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)


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
    message_json = json.loads(message.payload)
    if message_json["deviceid"].lower() != mqttDeviceId.lower():
      print("not for me, move on")
      return
    print("Received message " + str(message.payload) + " on topic " + message.topic)
    if 'reboot' in message_json and message_json['reboot']:
      try:
        os.system('/sbin/reboot')
      except Exception:
        print("reboot failed")
    if 'twitter_handles' in message_json:
        at = ' @'
        print message_json["twitter_handles"]
        config.twitter_handles = at.join(message_json["twitter_handles"])
    if 'alarm_on' in message_json:
      alarm = message_json["alarm_on"]
      if not alarm:
          print("Alarm off")
          GPIO.remove_event_detect(pir_pin)
          GPIO.remove_event_detect(door_pin)
          GPIO.output(alert_pin, False)
      else:
          print("Alarm on")
          try:
              GPIO.add_event_detect(pir_pin, GPIO.RISING)
              GPIO.add_event_detect(door_pin, GPIO.RISING)
              GPIO.add_event_callback(pir_pin, alarm_callback)
              GPIO.add_event_callback(door_pin, alarm_callback)
          except RuntimeError:
              print("alarm is already on")

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
mqttClient.subscribe(mqttConfigTopic, 1)
registryData = {}
registryData["DeviceId"] = mqttDeviceId

import netifaces
default_gw_intf = netifaces.gateways()["default"][netifaces.AF_INET][1]
default_gw_intf_ip = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_INET][0]["addr"]
registryData["IPAddr"] = default_gw_intf_ip
mac_address = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_LINK][0]["addr"]
registryData["MacAddr"] = mac_address
registryDataJson = json.dumps(registryData)


def alarm_callback(channel, deviceid=deviceid):
    timestamp = time.strftime("%y%m%d_%H%M%S")
    if channel == pir_pin:
        alarm_type = "motion"
        filename = "".join(["/tmp/pic", timestamp, ".jpg"])
        camera.capture(filename)
        message = "#" + alarm_type + "5493 Detected at " + timestamp + " by #" + deviceid + " @" + config.twitter_handles
        try:
            tweet = api.update_with_media(filename, status=message)
        except:
            tweet = None
        os.remove(filename)
    if channel == door_pin:
        if GPIO.input(channel):
            alarm_type = "door"
            message = "#" + alarm_type + "5493 Detected at " + timestamp + " by #" + deviceid + " @" + config.twitter_handles
            try:
                tweet = api.update_status(message)
            except:
                tweet = None
        else:
            return
    print(message)
    telemetryData = {}
    telemetryData["DeviceId"] = deviceid
    telemetryData["Timestamp"] = timestamp
    telemetryData["Type"] = alarm_type
    if tweet:
        telemetryData["Tweet_id"] = str(tweet.id)
        telemetryData["Tweet_url"] = "https://twitter.com/" + tweet._json["user"]["screen_name"] + "/statuses/" + telemetryData["Tweet_id"]
    telemetryDataJson = json.dumps(telemetryData)
    mqttClient.publish(mqttTelemetryTopic, telemetryDataJson, 1)
    GPIO.output(alert_pin, True)

def main_loop(sleep=sleepTime):
    init_camera()
    while True:
        mqttClient.publish(mqttRegisterTopic, registryDataJson, 0)
        time.sleep(sleep)

if __name__ == '__main__':
    try:
        main_loop()
    except KeyboardInterrupt:
        print("exiting by keyboard interrupt")
        mqttClient.loop_stop()
        mqttClient.disconnect()
