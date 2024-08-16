import ctypes
import time
import subprocess

class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [("cbSize", ctypes.c_uint),
                ("dwTime", ctypes.c_uint)]

def get_idle_duration():
    lii = LASTINPUTINFO()
    lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
    ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii))
    idle_duration = ctypes.windll.kernel32.GetTickCount() - lii.dwTime
    return idle_duration

# INACTIVITY_THRESHOLD = 3  # in seconds
INACTIVITY_THRESHOLD = 10 * 60  # in seconds
while True:
    idle_duration = get_idle_duration() / 1000  # Convert from milliseconds to seconds
    if idle_duration > INACTIVITY_THRESHOLD:
        subprocess.run(["logoff", "rdp-tcp"])
        # print("I love the monkey head\n")
        exit()
    time.sleep(1)  # Check every second