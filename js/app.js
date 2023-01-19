(function () {
    var hostname = ["127.0.0.1", "localhost"];
    if ((window.location.protocol != "https:") && (hostname.indexOf(window.location.hostname) < 0)) {
        window.location.protocol = "https";
    }

    if (!window.TextEncoder) {
        window.TextEncoder = function TextEncoder() {};
        window.TextEncoder.prototype.encode = function(s) {
            var escstr = encodeURIComponent(s);
            var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(_match, p1) {
                return String.fromCharCode('0x' + p1);
            });
            var ua = new Uint8Array(binstr.length);
            Array.prototype.forEach.call(binstr, function (ch, i) {
                ua[i] = ch.charCodeAt(0);
            });
            return ua;
        }
    }

    function onDOMLoad() {
        var btn = document.getElementById('broadcast');
        var ssidInput = document.getElementById('ssid');
        var passwordInput = document.getElementById('password');
        var ringElement = document.getElementById('ring');
        var rippleElement = document.getElementById('ripple');
        var logoImage = document.getElementById('logo');
        var payload = null;
        var encoder = new TextEncoder();
        var channel = Math.floor(Math.random() * (1 << 16));

        var onClick = function (_e) {
            if (btn.innerText != 'BROADCAST') {
                btn.innerText = 'BROADCAST';
                rippleElement.hidden = true;
                logoImage.hidden = false;
                return;
            }

            var ssid = encoder.encode(ssidInput.value);
            var password = encoder.encode(passwordInput.value);

            if (ssid) {
                btn.innerText = 'STOP';
                logoImage.hidden = true;
                rippleElement.hidden = false;
               
                payload = new Uint8Array(1 + ssid.length + 1 + password.length + 2);
                payload[0] = ssid.length;
                payload.set(ssid, 1);
                payload[1 + ssid.length] = password.length;
                payload.set(password, 1 + ssid.length + 1);
                payload[1 + ssid.length + 1 + password.length] = channel & 0xFF;
                payload[1 + ssid.length + 1 + password.length + 1] = channel >> 8;

                console.log('tx: ', payload);

                var onFinish = function () {
                    if (btn.innerText != 'BROADCAST') {
                        setTimeout(function () {
                            if (btn.innerText != 'BROADCAST') {
                                console.log('repeat', payload);
                                window.transmit.transmit(payload);
                            }
                        }, 1000);
                    } else {
                        console.log('finished');
                    }
                };

                if (!window.transmit) {
                    window.transmit = Quiet.transmitter({ profile: 'wave', onFinish: onFinish, clampFrame: false });
                }
                window.transmit.transmit(payload);
            }
        };

        btn.addEventListener('click', onClick, false);
        btn.disabled = true;

        var onQuietReady = function () {
            btn.disabled = false;
            ringElement.hidden = true;
            logoImage.hidden = false;
        };
        var onQuietFail = function (reason) {
            console.log("quiet failed to initialize: " + reason);
        };

        Quiet.addReadyCallback(onQuietReady, onQuietFail);

        Quiet.init({
            profilesPath: "quiet-profiles.json",
            memoryInitializerPath: "js/quiet-emscripten.js.mem",
            emscriptenPath: "js/quiet-emscripten.js"
        });

    };

    document.addEventListener("DOMContentLoaded", onDOMLoad);
})();
