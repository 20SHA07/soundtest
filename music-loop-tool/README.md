# 16-Bit Music Loop Tool

A retro-style music sequencer application that allows users to create and play 16-step music loops with 8 different instruments, featuring real-time waveform visualization.

## Features

- **16-Step Sequencer**: Create patterns with 8 different instruments
- **Real-time Waveform Visualization**: See your audio output visualized in a 16-bit aesthetic
- **Responsive Design**: Works on different screen sizes
- **Keyboard Shortcuts**: Use space bar to toggle play/stop
- **Tempo Control**: Adjust playback speed from 60-180 BPM
- **16-bit Audio Processing**: Retro sound processing for certain instruments

## Instruments

1. **Kick**: Bass drum
2. **Snare**: Snare drum
3. **Hi-hat**: Hi-hat cymbal
4. **Percussion**: Additional percussion sounds
5. **Bass**: Bass synthesizer
6. **Lead**: Lead synthesizer
7. **Chord**: Chord synthesizer
8. **Effect**: Special effects

## Technical Implementation

### Audio Engine
- Built with Tone.js for audio processing
- Implements sample loading and playback
- Features bit crusher effects for 16-bit sound aesthetic
- Includes analyzer for waveform visualization

### Sequencer
- 16-step pattern sequencer
- Supports 8 instrument tracks
- Optimized for performance with active step caching
- Maintains accurate timing during extended playback

### User Interface
- Responsive design that works on various screen sizes
- Real-time waveform visualization with 16-bit aesthetic
- Interactive step buttons with visual feedback
- Help section with instructions for users

## Optimization Features

- Memory management for audio resources
- Performance optimization for sequencer playback
- Efficient waveform rendering
- Responsive design considerations

## Browser Compatibility

The application works best in modern browsers that support:
- Web Audio API
- Canvas API
- ES6 JavaScript features

## Credits

- Audio samples: 16-bit style drum and synth samples
- Font: "Press Start 2P" from Google Fonts
- Audio processing: Tone.js library