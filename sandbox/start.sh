#!/bin/bash
docker run -d --name piguard-agent --privileged --env-file ./$1 -v /opt/vc/lib:/opt/vc/lib -v /dev/mem:/dev/mem jerryz/piguard-agent:raspbian
