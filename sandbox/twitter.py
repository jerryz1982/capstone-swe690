#!/usr/bin/env python
# -*- coding: utf-8 -*-
 
import tweepy, time, sys
from piguard.common import config

cfg = config.PiguardConfig() 
#enter the corresponding information from your Twitter application:
CONSUMER_KEY = cfg.twitter_consumer_key#keep the quotes, replace this with your consumer key
CONSUMER_SECRET = cfg.twitter_consumer_secret #keep the quotes, replace this with your consumer secret key
ACCESS_KEY = cfg.twitter_access_key#keep the quotes, replace this with your access token
ACCESS_SECRET = cfg.twitter_access_secret#keep the quotes, replace this with your access token secret
#import pdb; pdb.set_trace()
print CONSUMER_KEY + CONSUMER_SECRET + ACCESS_KEY + ACCESS_SECRET
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
api = tweepy.API(auth)
 
line = "hello world @xyzjerry #motion5493" 
#api.update_status(line)
tweet_status = api.update_with_media("/home/dahoo/Pictures/helloworld.gif", line)
import pdb; pdb.set_trace()
