from cgitb import handler

from inotify_simple import INotify, flags
import os

inotify = INotify()
watch_flags = flags.CREATE | flags.MODIFY | flags.DELETE | flags.MOVED_FROM | flags.MOVED_TO

wd = inotify.add_watch('./../Raiz', watch_flags)

print("Vigilando cambios en vaultsync_folder...")

while True:
    for event in inotify.read():
        print(f"Evento: {event} - Archivo: {event.name}")
        handlernodos =
