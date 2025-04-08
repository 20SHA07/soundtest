/**
 * sequencer.js - Sequencer logic for the 16-Bit Music Loop Tool
 * Handles grid state, step sequencing, and playback scheduling
 */

class Sequencer {
    constructor(audioEngine) {
        // Store reference to audio engine
        this.audioEngine = audioEngine;
        
        // Sequencer configuration
        this.numRows = 8;        // 8 instrument rows
        this.numSteps = 16;      // 16 steps per row
        this.currentStep = -1;   // Current step being played (-1 when stopped)
        
        // Initialize grid state (8 rows x 16 steps)
        this.grid = Array(this.numRows).fill().map(() => Array(this.numSteps).fill(false));
        
        // Scheduling variables
        this.stepDuration = '16n';  // 16th note duration
        this.scheduleId = null;     // Tone.js event ID
        
        // Playback state
        this.isPlaying = false;
        
        // Performance optimization
        this.activeStepsCache = new Map(); // Cache active steps for quick lookup
    }

    /**
     * Initialize the sequencer
     */
    init() {
        // Set up the step sequencer loop with precise timing
        this.scheduleId = Tone.Transport.scheduleRepeat((time) => {
            this.onStep(time);
        }, this.stepDuration);
        
        // Reset the current step
        this.currentStep = -1;
        
        // Initialize active steps cache
        this.updateActiveStepsCache();
        
        console.log('Sequencer initialized');
    }

    /**
     * Called on each sequencer step
     * @param {number} time - Tone.js time
     */
    onStep(time) {
        // Update current step
        this.currentStep = (this.currentStep + 1) % this.numSteps;
        
        // Trigger active notes for this step using the cache for better performance
        const activeRows = this.activeStepsCache.get(this.currentStep);
        if (activeRows) {
            for (const row of activeRows) {
                this.audioEngine.scheduleNote(row, time);
            }
        }
        
        // Dispatch step event for UI updates
        this.dispatchStepEvent();
    }

    /**
     * Dispatch custom event for step change
     */
    dispatchStepEvent() {
        const event = new CustomEvent('sequencer:step', {
            detail: {
                step: this.currentStep
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Update the cache of active steps for performance optimization
     */
    updateActiveStepsCache() {
        this.activeStepsCache.clear();
        
        for (let step = 0; step < this.numSteps; step++) {
            const activeRows = [];
            
            for (let row = 0; row < this.numRows; row++) {
                if (this.grid[row][step]) {
                    activeRows.push(row);
                }
            }
            
            if (activeRows.length > 0) {
                this.activeStepsCache.set(step, activeRows);
            }
        }
    }

    /**
     * Toggle a step in the grid
     * @param {number} row - Row index
     * @param {number} step - Step index
     * @returns {boolean} New state of the step
     */
    toggleStep(row, step) {
        if (row >= 0 && row < this.numRows && step >= 0 && step < this.numSteps) {
            this.grid[row][step] = !this.grid[row][step];
            
            // Update the active steps cache
            this.updateActiveStepCache(row, step);
            
            // If we're currently on this step and it's now active, play the sound immediately
            if (this.isPlaying && this.currentStep === step && this.grid[row][step]) {
                this.audioEngine.scheduleNote(row, Tone.now());
            }
            
            return this.grid[row][step];
        }
        return false;
    }

    /**
     * Update a single entry in the active steps cache
     * @param {number} row - Row index
     * @param {number} step - Step index
     */
    updateActiveStepCache(row, step) {
        const isActive = this.grid[row][step];
        let activeRows = this.activeStepsCache.get(step) || [];
        
        if (isActive) {
            // Add row to active rows if not already present
            if (!activeRows.includes(row)) {
                activeRows.push(row);
                this.activeStepsCache.set(step, activeRows);
            }
        } else {
            // Remove row from active rows
            activeRows = activeRows.filter(r => r !== row);
            if (activeRows.length > 0) {
                this.activeStepsCache.set(step, activeRows);
            } else {
                this.activeStepsCache.delete(step);
            }
        }
    }

    /**
     * Set a step in the grid
     * @param {number} row - Row index
     * @param {number} step - Step index
     * @param {boolean} state - State to set
     */
    setStep(row, step, state) {
        if (row >= 0 && row < this.numRows && step >= 0 && step < this.numSteps) {
            this.grid[row][step] = state;
            this.updateActiveStepCache(row, step);
        }
    }

    /**
     * Get the state of a step
     * @param {number} row - Row index
     * @param {number} step - Step index
     * @returns {boolean} State of the step
     */
    getStep(row, step) {
        if (row >= 0 && row < this.numRows && step >= 0 && step < this.numSteps) {
            return this.grid[row][step];
        }
        return false;
    }

    /**
     * Get the current step being played
     * @returns {number} Current step index
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * Clear all steps in the grid
     */
    clearGrid() {
        this.grid = Array(this.numRows).fill().map(() => Array(this.numSteps).fill(false));
        this.activeStepsCache.clear();
    }

    /**
     * Set a predefined pattern
     * @param {Array} pattern - 2D array representing the pattern
     */
    setPattern(pattern) {
        if (Array.isArray(pattern) && pattern.length === this.numRows) {
            for (let row = 0; row < this.numRows; row++) {
                if (Array.isArray(pattern[row]) && pattern[row].length === this.numSteps) {
                    this.grid[row] = [...pattern[row]];
                }
            }
            this.updateActiveStepsCache();
        }
    }

    /**
     * Start the sequencer
     */
    start() {
        this.audioEngine.start();
        this.isPlaying = true;
    }

    /**
     * Stop the sequencer
     */
    stop() {
        this.audioEngine.stop();
        this.isPlaying = false;
        this.currentStep = -1;
        this.dispatchStepEvent();
    }

    /**
     * Set the tempo (BPM)
     * @param {number} bpm - Beats per minute
     */
    setTempo(bpm) {
        this.audioEngine.setTempo(bpm);
    }
    
    /**
     * Get the playback state
     * @returns {boolean} True if sequencer is playing
     */
    isSequencerPlaying() {
        return this.isPlaying;
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        if (this.scheduleId !== null) {
            Tone.Transport.clear(this.scheduleId);
            this.scheduleId = null;
        }
    }
}