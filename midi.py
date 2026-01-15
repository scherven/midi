import mido
from datetime import datetime
import time

# List available MIDI input ports
print("Available MIDI ports:")
print(mido.get_input_names())

# Open your MIDI input port (replace with your actual port name)
port_name = mido.get_input_names()[0]  # or specify explicitly

# Create output file with timestamp
filename = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mid"
output_file = mido.MidiFile()
track = mido.MidiTrack()
output_file.tracks.append(track)

print(f"Recording to {filename}... Press Ctrl+C to stop")

last_time = time.perf_counter()  # More precise than time.time()
save_counter = 0
SAVE_INTERVAL = 500  # Save every 500 messages instead of 100

try:
    with mido.open_input(port_name) as inport:
        for msg in inport:
            # Calculate delta time in seconds
            current_time = time.perf_counter()
            delta_time = current_time - last_time
            last_time = current_time
            
            # Convert note_on with velocity 0 to note_off
            if msg.type == 'note_on' and msg.velocity == 0:
                msg = mido.Message('note_off', 
                                   note=msg.note, 
                                   velocity=64, 
                                   channel=msg.channel)
            
            # Set the delta time in MIDI ticks
            msg.time = mido.second2tick(delta_time, 
                                        output_file.ticks_per_beat, 
                                        500000)
            
            track.append(msg)
            save_counter += 1
            
            # Show progress every 1000 messages
            if save_counter % 1000 == 0:
                print(f"Recorded {save_counter} messages...")
            
            # Periodically save to disk
            if save_counter % SAVE_INTERVAL == 0:
                output_file.save(filename)
                
except KeyboardInterrupt:
    print("\nRecording stopped")
except Exception as e:
    print(f"\nError occurred: {e}")
    
# Final save
print("Saving final file...")
output_file.save(filename)
print(f"Saved {len(track)} MIDI messages to {filename}")
