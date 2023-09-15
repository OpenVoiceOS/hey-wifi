import os
import queue
from os.path import dirname
from threading import Thread

import numpy as np
import quiet
from ovos_bus_client import Message
from ovos_plugin_manager.templates.transformers import AudioTransformer
from ovos_utils.log import LOG

PROFILES = os.path.join(dirname(os.path.abspath(__file__)), 'quiet-profiles.json')


class Decoder(Thread):
    def __init__(self, sample_rate=48000, channels=1, select=0, bits_per_sample=16):
        super().__init__(daemon=True)
        self.channels = channels
        self.select = select
        self.done = None
        self.sample_rate = sample_rate
        self.thread = None
        self.queue = queue.Queue()
        if bits_per_sample == 16:
            self.dtype = np.int16
        elif bits_per_sample == 32:
            self.dtype = np.int32
        else:
            raise ValueError(f'{bits_per_sample} bits per sample is not supported')

    def put(self, data):
        self.queue.put(data)

    def run(self):
        self.done = False
        decoder = quiet.Decoder(sample_rate=self.sample_rate,
                                profile_name='wave',
                                profiles=PROFILES)

        while not self.done:
            audio = self.queue.get()
            audio = np.fromstring(audio, dtype=self.dtype)
            if self.channels > 1:
                audio = audio[self.select::self.channels]
            audio = audio.astype('float32')
            data = decoder.decode(audio)
            if data is not None:
                self.on_data(data)

    def stop(self):
        self.done = True
        self.queue.put('')

    def on_data(self, data):
        print(data)


class QuietPlugin(AudioTransformer):
    def __init__(self, config=None):
        config = config or {}
        super().__init__("ovos-audio-transformer-plugin-quietpy", 10, config)
        self.decoder = Decoder()
        self.decoder.on_data = self.on_data
        self.decoder.start()

    def on_data(self, data):
        ssid_length = data[0]
        ssid = data[1:ssid_length + 1].tostring().decode('utf-8')
        password_length = data[ssid_length + 1]
        password = data[ssid_length + 2:ssid_length + password_length + 2].tostring().decode('utf-8')
        LOG.info(f'SSID: {ssid} Password: {password}')

        if not password:
            LOG.info("wifi is open, no password")
            data = {"connection_name": self._ssid}
            self.bus.emit(Message("ovos.phal.nm.connect.open.network", data))
        else:
            LOG.info(f"Wifi PSWD {password}")
            data = {"connection_name": self._ssid, "password": password}
            self.bus.emit(Message("ovos.phal.nm.connect", data))

    # plugin api
    def on_audio(self, audio_data):
        self.decoder.put(audio_data)
        return audio_data

