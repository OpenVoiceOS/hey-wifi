# Hey, Wifi

![](https://voice-engine.github.io/hey-wifi/img/scenario.svg)

Send WiFi settings through sound wave.

The project is based on [quiet](https://github.com/quiet)

# Requirements

needs  [ovos-PHAL-plugin-network-manager](https://github.com/OpenVoiceOS/ovos-PHAL-plugin-network-manager) to handle wifi setup

```
pip3 install --no-deps quiet.py    # for ARM platform
```

For x86, go to https://github.com/OpenVoiceOS/quiet.py to install `quiet.py`

# Config

```javascript
"listener": {
    "audio_transformers": {
        "ovos-audio-transformer-plugin-quietpy": {}
    }
}
```

# Usage
1. install plugin on device
2. go to https://openvoiceos.github.io/hey-wifi using a computer or a phone
