/**
 * audio.js - Audio engine for the 16-Bit Music Loop Tool
 * Handles audio initialization, sample loading, and playback
 */

class AudioEngine {
    constructor() {
        // Audio state
        this.initialized = false;
        this.isPlaying = false;
        
        // Audio components
        this.players = {};
        this.masterVolume = null;
        this.analyzer = null;
        
        // Default tempo
        this.tempo = 120;
        
        // Sample paths
        this.samplePaths = [
            'audio/samples/kick.wav',
            'audio/samples/snare.wav',
            'audio/samples/hihat.wav',
            'audio/samples/percussion.wav',
            'audio/samples/bass.wav',
            'audio/samples/lead_synth.wav',
            'audio/samples/chord_pad.wav',
            'audio/samples/effect_noise.wav'
        ];
        
        // Memory management
        this.buffers = [];
    }
    
    /**
     * Initialize the audio engine
     * @returns {Promise<boolean>} Success status
     */
    async init() {
        try {
            // Start audio context
            await Tone.start();
            console.log('Audio context started');
            
            // Create master volume
            this.masterVolume = new Tone.Volume(-6).toDestination();
            
            // Create analyzer for visualization
            this.analyzer = new Tone.Analyser('waveform', 1024);
            this.masterVolume.connect(this.analyzer);
            
            // Set initial tempo
            Tone.Transport.bpm.value = this.tempo;
            
            // Load samples
            await this.loadSamples();
            
            this.initialized = true;
            console.log('Audio engine initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            return false;
        }
    }
    
    /**
     * Load audio samples
     * @returns {Promise<void>}
     */
    async loadSamples() {
        try {
            // Create players for each instrument
            for (let i = 0; i < this.samplePaths.length; i++) {
                const player = new Tone.Player({
                    url: this.samplePaths[i],
                    onload: () => console.log(`Loaded sample: ${this.samplePaths[i]}`),
                    onerror: (e) => console.error(`Error loading sample: ${this.samplePaths[i]}`, e)
                }).connect(this.masterVolume);
                
                // Store buffer reference for memory management
                this.buffers.push(player.buffer);
                
                // Apply bit crusher effect to certain instruments for 16-bit sound
                if (i >= 4 && i <= 6) { // Bass, Lead, Chord
                    const bitCrusher = new Tone.BitCrusher(8).connect(this.masterVolume);
                    player.disconnect();
                    player.connect(bitCrusher);
                }
                
                this.players[i] = player;
            }
            
            console.log('All samples loaded');
        } catch (error) {
            console.error('Error loading samples:', error);
            throw error;
        }
    }
    
    /**
     * Schedule a note to play
     * @param {number} instrumentIndex - Index of the instrument
     * @param {number} time - Tone.js time
     */
    scheduleNote(instrumentIndex, time) {
        if (!this.initialized) return;
        
        const player = this.players[instrumentIndex];
        if (player) {
            // Restart the player at the specified time
            player.start(time);
        }
    }
    
    /**
     * Start audio playback
     */
    start() {
        if (!this.initialized) return;
        
        Tone.Transport.start();
        this.isPlaying = true;
        console.log('Audio playback started');
    }
    
    /**
     * Stop audio playback
     */
    stop() {
        if (!this.initialized) return;
        
        Tone.Transport.stop();
        this.isPlaying = false;
        console.log('Audio playback stopped');
    }
    
    /**
     * Set the tempo (BPM)
     * @param {number} bpm - Beats per minute
     */
    setTempo(bpm) {
        if (!this.initialized) return;
        
        this.tempo = bpm;
        Tone.Transport.bpm.value = bpm;
        console.log(`Tempo set to ${bpm} BPM`);
    }
    
    /**
     * Get visualization data for waveform display
     * @returns {Float32Array} Audio waveform data
     */
    getVisualizationData() {
        if (!this.initialized || !this.analyzer) return new Float32Array(1024).fill(0);
        
        // Get analyzer data
        const data = this.analyzer.getValue();
        
        // Apply some smoothing for better visualization
        for (let i = 0; i < data.length; i++) {
            // Add a small offset to ensure there's always some visual activity
            if (this.isPlaying && Math.abs(data[i]) < 0.01) {
                data[i] += (Math.random() * 0.005) - 0.0025;
            }
        }
        
        return data;
    }
    
    /**
     * Get playback state
     * @returns {boolean} True if audio is playing
     */
    getPlaybackState() {
        return this.isPlaying;
    }
    
    /**
     * Clean up resources when no longer needed
     * Important for memory management
     */
    cleanup() {
        // Stop all players
        Object.values(this.players).forEach(player => {
            player.stop();
            player.dispose();
        });
        
        // Dispose of analyzer
        if (this.analyzer) {
            this.analyzer.dispose();
        }
        
        // Dispose of master volume
        if (this.masterVolume) {
            this.masterVolume.dispose();
        }
        
        // Clear buffers
        this.buffers.forEach(buffer => {
            if (buffer) buffer.dispose();
        });
        
        this.buffers = [];
        this.players = {};
        this.initialized = false;
        
        console.log('Audio engine resources cleaned up');
    }
}