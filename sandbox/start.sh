#!/bin/bash
docker run -d --name piguard-agent --privileged -e PI_DEVICE_ID=$1 -v /opt/vc/lib:/opt/vc/lib -v /dev/mem:/dev/mem jerryz/piguard-agent:raspbian
