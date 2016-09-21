FROM resin/rpi-raspbian:latest
RUN apt-get update -y && \
    apt-get install -y curl \
    python-dev \
    gcc
RUN curl -s https://bootstrap.pypa.io/get-pip.py | python
RUN pip install paho-mqtt \
    netifaces \
    picamera \
    RPi.GPIO \
    tweepy
COPY mqtt_agent4.py /
ENTRYPOINT ["python", "mqtt_agent4.py"]
ENV LD_LIBRARY_PATH /opt/vc/lib
