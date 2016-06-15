from ConfigParser import SafeConfigParser

parser = SafeConfigParser()
parser.read('piguard.ini')
class PiguardConfig(object):
    def __init__(self):
        self.twitter_consumer_key = parser.get('twitter', 'consumer_key')
        self.twitter_consumer_secret = parser.get('twitter', 'consumer_secret')
        self.twitter_access_key = parser.get('twitter', 'access_key')
        self.twitter_access_secret = parser.get('twitter', 'access_secret')
        self.mqtt_device_id = parser.get('mqtt', 'device_id')
        self.mqtt_broker_host = parser.get('mqtt', 'broker_host')
        self.mqtt_broker_port = parser.get('mqtt', 'broker_port')
        self.mqtt_user = parser.get('mqtt', 'user')
        self.mqtt_password = parser.get('mqtt', 'password')
        self.mqtt_vhost = parser.get('mqtt', 'vhost')
