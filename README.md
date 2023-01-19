Hey, WiFi
=========

THIS IS WIP!

![](https://voice-engine.github.io/hey-wifi/img/scenario.svg)

Send WiFi settings through sound wave.
The project is based on [quiet](https://github.com/quiet)

### Supported Hardware
+ Raspberry Pi (with NetworkManager utils)

### Requirements
+ quiet.py
+ numpy

```
sudo apt install python3-numpy python3-pycryptodome
pip3 install --no-deps quiet.py    # for ARM platform
```

>For x86, go to https://github.com/OpenVoiceOS/quiet.py to install `quiet.py`

### Usage
1. run `main.py` on your device - TODO move to plugins
2. go to https://openvoiceos.github.io/hey-wifi using a computer or a phone
