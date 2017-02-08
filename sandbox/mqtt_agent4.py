import datetime  
import json  
import paho.mqtt.client  
import time  
import RPi.GPIO as GPIO
import tweepy
from picamera import PiCamera
from picamera import exc as cam_exception
import os
import pyttsx
import uuid
from tweepy.error import TweepError

import sys
import logging

logger = logging.getLogger('piguard-agent')
formatter = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(stream=sys.stdout, level=logging.INFO, format=formatter)

sleepTime = 30
deviceid = os.getenv('PI_DEVICE_ID', str(uuid.uuid1()))

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
        logger.info("camera intialized")
    except cam_exception.PiCameraError:
        camera = None
        logger.info("camera not enabled")


def init_speech():
    try:
        global engine
        engine = pyttsx.init()
    except Exception as e:
        logger.warning('speech module init failed:{0}'.format(e))

# MQTT details  
mqttDeviceId = deviceid 
mqttBrokerHost = os.getenv('MQTT_HOST', "hyena.rmq.cloudamqp.com")
mqttBrokerPort = 1883
mqttUser = os.getenv('MQTT_USER', 'dfwxdeyo')
mqttPassword = os.getenv('MQTT_PASS', "GTFbKpT7scn2nXgrWrtzfRLaniD0wfMr")
#mqttVhost = os.getenv('MQTT_USER', 'dfwxdeyo')
mqttTelemetryTopic = "RPi/Data"
mqttControlTopic = "RPi/Control"
mqttRegisterTopic = "RPi/Register"
mqttConfigTopic = "RPi/Config"

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
          logger.info("Connected to MQTT broker (RC: %s)" % rc)
    else:  
          logger.info("Connection to MQTT broker failed (RC: %s)" % rc)   
    mqttClient.subscribe(mqttControlTopic, 1)
    mqttClient.subscribe(mqttConfigTopic, 0)
def on_log(client, userdata, level, buf):  
    logger.info(buf)  
def on_publish(client, userdata, mid):  
    logger.info("Data published (Mid: %s)" % mid)  
def on_disconnect(client, userdata, rc):  
    if rc != 0:  
          logger.warning("Unexpected disconnect")  
    logger.warning("Disconnected from MQTT broker")  
def on_subscribe(client, userdata, mid, granted_qos):
    logger.info("Subscribed on topic")
def on_message(client, userdata, message):
    message_json = json.loads(message.payload)
    if message_json["deviceid"].lower() != mqttDeviceId.lower():
      logger.info("not for me, move on")
      return
    else:
      logger.info('received message', message_json)
    logger.info("Received message " + str(message.payload) + " on topic " + message.topic)
    if 'reboot' in message_json and message_json['reboot']:
      try:
        os.system('/sbin/reboot')
      except Exception:
        logger.info("reboot failed")
    if 'speech' in message_json and message_json['speech']:
      try:
        #os.system("/usr/bin/flite -t hello")
        engine.say('incoming message: {0}'.format(message_json['speech']))
        engine.runAndWait()
      except Exception, e:
        logger.warning('speech not enabled: {0}'.format(e))
    if 'dryrun' in message_json and message_json['dryrun']:
        logger.info("testing testing")
        alarm_callback(pir_pin, deviceid)
        alarm_callback(door_pin, deviceid, True)
    if 'twitter_handles' in message_json:
        at = ' @'
        logger.info(message_json["twitter_handles"])
        config.twitter_handles = at.join(message_json["twitter_handles"])
    if 'alarm_on' in message_json:
      alarm = message_json["alarm_on"]
      if not alarm:
          logger.info("Alarm off")
          GPIO.remove_event_detect(pir_pin)
          GPIO.remove_event_detect(door_pin)
          GPIO.output(alert_pin, False)
      else:
          logger.info("Alarm on")
          try:
              GPIO.add_event_detect(pir_pin, GPIO.RISING)
              GPIO.add_event_detect(door_pin, GPIO.RISING)
              GPIO.add_event_callback(pir_pin, alarm_callback)
              GPIO.add_event_callback(door_pin, alarm_callback)
          except RuntimeError:
              logger.warning("alarm is already on")

mqttClient = paho.mqtt.client.Client(protocol=3)  
#mqttClient.username_pw_set(mqttVhost + ":" + mqttUser, mqttPassword)  
mqttClient.username_pw_set(mqttUser, mqttPassword)
#mqttClient.username_pw_set(mqttUser, mqttPassword)
# Register callbacks  
mqttClient.on_connect = on_connect  
mqttClient.on_log = on_log  
mqttClient.on_publish = on_publish  
mqttClient.on_disconnnect = on_disconnect  
mqttClient.on_message = on_message
registryData = {}
registryData["DeviceId"] = mqttDeviceId

import netifaces
default_gw_intf = netifaces.gateways()["default"][netifaces.AF_INET][1]
default_gw_intf_ip = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_INET][0]["addr"]
registryData["IPAddr"] = default_gw_intf_ip
mac_address = netifaces.ifaddresses(default_gw_intf)[netifaces.AF_LINK][0]["addr"]
registryData["MacAddr"] = mac_address
registryDataJson = json.dumps(registryData)


def alarm_callback(channel, deviceid=deviceid, dryrun=False):
    timestamp = time.strftime("%y-%m-%d_%H:%M:%S_%Z")
    if channel == pir_pin:
        alarm_type = "motion"
        message = "#" + alarm_type + "5493 Detected at " + timestamp + " by #" + deviceid + " @" + config.twitter_handles
        if camera:
            filename = "".join(["/tmp/pic", timestamp, ".jpg"])
            camera.annotate_text = timestamp
            camera.capture(filename)
            try:
                tweet = api.update_with_media(filename, status=message)
            except:
                tweet = None
            os.remove(filename)
        else:
            try:
                tweet = api.update_status(message)
            except:
                tweet = None
    if channel == door_pin:
        if GPIO.input(channel) or dryrun:
            alarm_type = "door"
            message = "#" + alarm_type + "5493 Detected at " + timestamp + " by #" + deviceid + " @" + config.twitter_handles
            try:
                tweet = api.update_status(message)
            except:
                tweet = None
        else:
            return
    logger.info(message)
    telemetryData = {}
    telemetryData["DeviceId"] = deviceid
    telemetryData["Timestamp"] = timestamp
    telemetryData["Type"] = alarm_type
    if tweet:
        telemetryData["Tweet_id"] = str(tweet.id)
        telemetryData["Tweet_url"] = "https://twitter.com/" + tweet._json["user"]["screen_name"] + "/statuses/" + telemetryData["Tweet_id"]
    telemetryDataJson = json.dumps(telemetryData)
    try:
        mqttClient.publish(mqttTelemetryTopic, telemetryDataJson, 1)
    except Exception:
        logging.error("mqtt connection failed")
    GPIO.output(alert_pin, True)

def main_loop(sleep=sleepTime):
    init_camera()
    init_speech()
    # Connect to MQTT broker
    mqttClient.connect(mqttBrokerHost, mqttBrokerPort, 60)
    mqttClient.loop_start()
    # Collect telemetry information from Sense HAT and publish to MQTT broker in JSON format
    mqttClient.subscribe(mqttControlTopic, 1)
    mqttClient.subscribe(mqttConfigTopic, 0)
    while True:
        try:
            mqttClient.publish(mqttRegisterTopic, registryDataJson, 0)
        except Exception:
            logging.error("mqtt connection failed")
        time.sleep(sleep)

if __name__ == '__main__':
    try:
        main_loop()
    except KeyboardInterrupt:
        logger.info("exiting by keyboard interrupt")
        mqttClient.loop_stop()
        mqttClient.disconnect()
