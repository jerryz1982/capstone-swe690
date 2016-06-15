#!/usr/bin/env python
# -*- coding: utf-8 -*-
 
import tweepy, time, sys
 
#enter the corresponding information from your Twitter application:
CONSUMER_KEY = 'pEqk36xG4exYbEse25SSIUJcv'#keep the quotes, replace this with your consumer key
CONSUMER_SECRET = 'L9IVMD5rb5R9aJXKd4puV8sC9UupbNP2eOoPEv0B7KDxa5YUhJ'#keep the quotes, replace this with your consumer secret key
ACCESS_KEY = '740591748968153089-0G04ug1TVd9OPjZn6d9C85Q7HJFntME'#keep the quotes, replace this with your access token
ACCESS_SECRET = 'fqC2YW55dHJYglWJWdoJBMBr5Omtv7kY5fKMIv5y2yokJ'#keep the quotes, replace this with your access token secret
auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
api = tweepy.API(auth)
 
line = "hello world @xyzjerry #motion5493" 
#api.update_status(line)
api.update_with_media("/home/dahoo/Pictures/helloworld.gif", line)
