#!/bin/bash

# ping the router, no need to hit google for this.
SERVER=192.168.1.1
#specify wlan interface
WLANINTERFACE=wlan0

# Only send two pings, sending output to /dev/null
ping -I ${WLANINTERFACE} -c2 ${SERVER} > /dev/null

# If the return code from ping ($?) is not 0 (meaning there was an error)
if [ $? != 0 ]
then
# Restart the wireless interface
/sbin/ifdown --force ${WLANINTERFACE}
/sbin/ifup ${WLANINTERFACE}
fi
