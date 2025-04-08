/**
 * ui.js - User interface logic for the 16-Bit Music Loop Tool
 * Handles UI interactions, visualization, and event handling
 */

document.addEventListener('DOMContentLoaded', () => {
    // Create audio engine and sequencer
    const audioEngine = new AudioEngine();
    const sequencer = new Sequencer(audioEngine);
    
    // Get UI elements
    const playButton = document.getElementById('play-btn');
    const stopButton = document.getElementById('stop-btn');
    const tempoSlider = document.getElementById('tempo-slider');
    const tempoValue = document.getElementById('tempo-value');
    const visualizer = document.getElementById('visualizer');
    
    // Visualization context
    const visualizerCtx = visualizer.getContext('2d');
    
    // Initialize audio engine and sequencer
    let isInitialized = false;
    
    /**
     * Initialize the application
     */
    async function init() {
        try {
            // Initialize audio engine
            const audioInitialized = await audioEngine.init();
            if (!audioInitialized) {
                throw new Error('Failed to initialize audio engine');
            }
            
            // Initialize sequencer
            sequencer.init();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set up default pattern
            setupDefaultPattern();
            
            // Start visualization loop
            updateVisualization();
            
            // Resize visualizer
            resizeVisualizer();
            
            // Set initial tempo display
            tempoValue.textContent = tempoSlider.value;
            
            isInitialized = true;
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            alert('Failed to initialize audio. Please check your browser settings and try again.');
        }
    }
    
    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Play button
        playButton.addEventListener('click', () => {
            if (isInitialized) {
                sequencer.start();
                playButton.classList.add('active');
                stopButton.classList.remove('active');
            }
        });
        
        // Stop button
        stopButton.addEventListener('click', () => {
            if (isInitialized) {
                sequencer.stop();
                stopButton.classList.add('active');
                playButton.classList.remove('active');
            }
        });
        
        // Tempo slider
        tempoSlider.addEventListener('input', () => {
            if (isInitialized) {
                const tempo = parseInt(tempoSlider.value);
                sequencer.setTempo(tempo);
                tempoValue.textContent = tempo;
            }
        });
        
        // Step buttons
        const stepButtons = document.querySelectorAll('.step');
        stepButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (isInitialized) {
                    const row = parseInt(button.dataset.row);
                    const step = parseInt(button.dataset.step);
                    const isActive = sequencer.toggleStep(row, step);
                    
                    if (isActive) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                    
                    // Flash effect
                    button.classList.add('flash');
                    setTimeout(() => {
                        button.classList.remove('flash');
                    }, 200);
                }
            });
        });
        
        // Sequencer step event
        document.addEventListener('sequencer:step', (event) => {
            const { step } = event.detail;
            updateCurrentStepIndicators(step);
        });
        
        // Window resize event
        window.addEventListener('resize', resizeVisualizer);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (sequencer.isSequencerPlaying()) {
                    stopButton.click();
                } else {
                    playButton.click();
                }
            }
        });
        
        // Help button
        const helpButton = document.getElementById('help-btn');
        if (helpButton) {
            helpButton.addEventListener('click', toggleHelpModal);
        }
        
        // Close help modal
        const closeHelpButton = document.getElementById('close-help');
        if (closeHelpButton) {
            closeHelpButton.addEventListener('click', toggleHelpModal);
        }
        
        // Close help modal when clicking outside
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            window.addEventListener('click', (event) => {
                if (event.target === helpModal) {
                    toggleHelpModal();
                }
            });
        }
    }
    
    /**
     * Toggle help modal visibility
     */
    function toggleHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.toggle('show');
        }
    }
    
    /**
     * Set up a default pattern
     */
    function setupDefaultPattern() {
        // Simple drum pattern
        sequencer.setStep(0, 0, true);  // Kick on step 1
        sequencer.setStep(0, 8, true);  // Kick on step 9
        sequencer.setStep(1, 4, true);  // Snare on step 5
        sequencer.setStep(1, 12, true); // Snare on step 13
        sequencer.setStep(2, 2, true);  // Hi-hat on step 3
        sequencer.setStep(2, 6, true);  // Hi-hat on step 7
        sequencer.setStep(2, 10, true); // Hi-hat on step 11
        sequencer.setStep(2, 14, true); // Hi-hat on step 15
        
        // Update UI to match
        updateGridUI();
    }
    
    /**
     * Resize visualizer canvas
     */
    function resizeVisualizer() {
        const container = visualizer.parentElement;
        visualizer.width = container.clientWidth;
        visualizer.height = container.clientHeight;
    }
    
    /**
     * Update current step indicators in the UI
     * @param {number} currentStep - Current step index
     */
    function updateCurrentStepIndicators(currentStep) {
        // Clear previous indicators
        clearCurrentStepIndicators();
        
        // Add indicator to current step
        if (currentStep >= 0) {
            for (let row = 0; row < 8; row++) {
                const button = document.querySelector(`.step[data-row="${row}"][data-step="${currentStep}"]`);
                if (button) {
                    button.classList.add('current');
                    
                    // If the step is active, add a pulse animation
                    if (button.classList.contains('active')) {
                        button.classList.add('pulse');
                    }
                }
            }
        }
    }
    
    /**
     * Clear current step indicators
     */
    function clearCurrentStepIndicators() {
        const currentButtons = document.querySelectorAll('.step.current');
        currentButtons.forEach(button => {
            button.classList.remove('current');
            button.classList.remove('pulse');
        });
    }
    
    /**
     * Update visualization
     */
    function updateVisualization() {
        if (isInitialized) {
            // Get visualization data
            const data = audioEngine.getVisualizationData();
            
            // Clear canvas
            visualizerCtx.fillStyle = '#1e1e1e';
            visualizerCtx.fillRect(0, 0, visualizer.width, visualizer.height);
            
            // Draw grid lines for 16-bit aesthetic
            drawGridLines();
            
            // Draw waveform
            visualizerCtx.lineWidth = 2;
            visualizerCtx.strokeStyle = '#00ff66';
            visualizerCtx.beginPath();
            
            const sliceWidth = visualizer.width / data.length;
            let x = 0;
            
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                const y = visualizer.height / 2 + v * visualizer.height / 2;
                
                if (i === 0) {
                    visualizerCtx.moveTo(x, y);
                } else {
                    visualizerCtx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            visualizerCtx.lineTo(visualizer.width, visualizer.height / 2);
            visualizerCtx.stroke();
            
            // Add pixelated effect for 16-bit aesthetic
            applyPixelatedEffect();
            
            // Draw center line
            visualizerCtx.strokeStyle = '#444444';
            visualizerCtx.lineWidth = 1;
            visualizerCtx.beginPath();
            visualizerCtx.moveTo(0, visualizer.height / 2);
            visualizerCtx.lineTo(visualizer.width, visualizer.height / 2);
            visualizerCtx.stroke();
            
            // Draw playback position indicator if playing
            if (sequencer.isSequencerPlaying()) {
                drawPlaybackPosition();
            }
        }
        
        // Continue animation loop
        requestAnimationFrame(updateVisualization);
    }
    
    /**
     * Draw grid lines for 16-bit aesthetic
     */
    function drawGridLines() {
        visualizerCtx.strokeStyle = '#333333';
        visualizerCtx.lineWidth = 1;
        
        // Horizontal grid lines
        const yStep = visualizer.height / 8;
        for (let y = yStep; y < visualizer.height; y += yStep) {
            visualizerCtx.beginPath();
            visualizerCtx.moveTo(0, y);
            visualizerCtx.lineTo(visualizer.width, y);
            visualizerCtx.stroke();
        }
        
        // Vertical grid lines - align with sequencer steps
        const xStep = visualizer.width / 16;
        for (let x = xStep; x < visualizer.width; x += xStep) {
            visualizerCtx.beginPath();
            visualizerCtx.moveTo(x, 0);
            visualizerCtx.lineTo(x, visualizer.height);
            visualizerCtx.stroke();
        }
    }
    
    /**
     * Apply pixelated effect for 16-bit aesthetic
     */
    function applyPixelatedEffect() {
        // This is a simplified version of pixelation
        // For a true pixelated effect, we would need to sample and reduce the resolution
        // of the waveform data, but this gives a visual approximation
        const pixelSize = 3;
        const imageData = visualizerCtx.getImageData(0, 0, visualizer.width, visualizer.height);
        visualizerCtx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Draw playback position indicator
     */
    function drawPlaybackPosition() {
        const currentStep = sequencer.getCurrentStep();
        if (currentStep >= 0) {
            const xStep = visualizer.width / 16;
            const x = currentStep * xStep + xStep / 2;
            
            visualizerCtx.strokeStyle = '#00ff66';
            visualizerCtx.lineWidth = 2;
            visualizerCtx.beginPath();
            visualizerCtx.moveTo(x, 0);
            visualizerCtx.lineTo(x, visualizer.height);
            visualizerCtx.stroke();
        }
    }
    
    /**
     * Update grid UI to match sequencer state
     */
    function updateGridUI() {
        for (let row = 0; row < 8; row++) {
            for (let step = 0; step < 16; step++) {
                const isActive = sequencer.getStep(row, step);
                const button = document.querySelector(`.step[data-row="${row}"][data-step="${step}"]`);
                
                if (button) {
                    if (isActive) {
                        button.classList.add('active');
                    } else {
                        button.classList.remove('active');
                    }
                }
            }
        }
    }
    
    // Initialize the application
    init();
});