// Test that script is loading
console.log('✅ app.js loaded successfully');

// App State
let sentences = [];
let currentSentence = '';
let findStartTime = null;
let reviewStartTime = null;
let findTimerInterval = null;
let reviewTimerInterval = null;
let findTime = 0;
let reviewTime = 0;
let sessionHistory = [];
let usedSentences = []; // Track used sentences in current session

// DOM Elements
const startScreen = document.getElementById('startScreen');
const findTimerScreen = document.getElementById('findTimerScreen');
const reviewTimerScreen = document.getElementById('reviewTimerScreen');
const resultsScreen = document.getElementById('resultsScreen');

const startBtn = document.getElementById('startBtn');
const stopFindBtn = document.getElementById('stopFindBtn');
const stopReviewBtn = document.getElementById('stopReviewBtn');
const newSessionBtn = document.getElementById('newSessionBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const downloadLogBtn = document.getElementById('downloadLogBtn');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const exportJSONBtn = document.getElementById('exportJSONBtn');

const sentenceDisplay = document.getElementById('sentenceDisplay');
const sentenceDisplayReview = document.getElementById('sentenceDisplayReview');
const findTimerDisplay = document.getElementById('findTimerDisplay');
const reviewTimerDisplay = document.getElementById('reviewTimerDisplay');
const findMilliseconds = document.getElementById('findMilliseconds');
const reviewMilliseconds = document.getElementById('reviewMilliseconds');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing app...');
    loadSentences();
    loadHistory();
    setupEventListeners();
    registerServiceWorker();
    setupInstallPrompt();
});



// Load Sentences - Embedded Version (No XML needed)
async function loadSentences() {
    console.log('📚 Loading sentences...');
    
    // Embedded sentences array
    const sentencesArray = [
	"Single engine failure - hover IGE.",
	"Single engine failure - hover OGE.",
	"Single engine failure - takeoff (including rejected take-off and transition to OEI flight).",
	"Single engine failure - flight.",
	"Single engine failure - approach.",
	"Single engine landing.",
	"Single engine emergency shutdown.",
	"Engine overspeed – driveshaft failure.",
	"Engine overspeed – governor failure.",
	"Engine underspeed – governor failure.",
	"Compressor stall.",
	"Droop compensation failure (NRO and N2 decrease/increase with collective changes).",
	"Double engine failure - hover IGE.",
	"Double engine failure - flight (leading to Autorotation).",
	"Double engine emergency shutdown.",
	"Engine oil temperature high.",
	"Inflight restart (attempted after flameout or shutdown).",
	"Engine fire on Gnd (indicated by FIRE 1/2 warning light).",
	"Engine fire in Flight (indicated by FIRE 1/2 warning light).",
	"Cabin fire.",
	"Electrical fire/short circuit.",
	"Tail rotor drive failure - hover.",
	"Tail Rotor Drive Failure/Fixed-pitch Tail Rotor Control Failure – forward flight.",
	"Pedal vibrations (impending tail rotor system failure).",
	"Electrical short circuit - generator system 1 or 2 cutoff.",
	"Generator overvoltage procedure.",
	"Electrical short circuit - battery bus/feeder line.",
	"Cyclic beep trim actuator failure/runaway.",
	"Cyclic force trim release failure.",
	"Mast moment indication failure.",
	"AVIO OVHT",
	"BAT DISCH",
	"BAT DISCON",
	"BLEED AIR",
	"BUSTIE OPN 1/2",
	"SYSTEM 1 / SYSTEM 2",
	"CAD FAN",
	"CAU DEGR",
	"CPDS OVHT",
	"DOORS",
	"ENG CHIP 1/2",
	"ENG O FILT 1/2",
	"ENG OIL P 1/2",
	"ENG PA DIS 1/2",
	"ENG SPLIT 1/2",
	"EPU DOOR",
	"EXT POWER",
	"F PUMP FWD/AFT",
	"F PUMP AFT",
	"F PUMP JET",
	"F QTY DEGR",
	"F QTY FAIL",
	"F VALVE CL 1/2",
	"FIRE E TST 1/2",
	"FIRE EXT 1/2",
	"FLI DEGR 1/2",
	"FLI FAIL 1/2",
	"FUEL FILT 1/2",
	"FUEL PRESS 1/2",
	"FUEL VALVE 1/2",
	"GEN DISCON 1 or 2",
	"GEN DISCON 1 and 2",
	"GEN OVHT 1/2",
	"HOR BAT",
	"HTG OVTEMP",
	"HYD PRESS 1/2",
	"INPUT FAIL",
	"INVERTER",
	"MM EXCEED",
	"OVSP FAIL 1/2",
	"P0 DIS",
	"PITOT HTR 1/2",
	"PRIME PUMP 1/2",
	"SHED EMER",
	"STARTER 1/2",
	"T0 DIS",
	"TWIST GRIP 1/2",
	"VAR NR",
	"VEMD FAN",
	"XMSN CHIP",
	"XMSN OIL T",
	"ENG CHP CT 1/2",
	"ENG OF CT 1/2",
	"F FLT CT 1/2",
	"XMSN CHP CT",
	"XMSN OT CT"

    ];
    
    sentences = sentencesArray;
    console.log(`✅ Loaded ${sentences.length} sentences`);
}


// Setup Event Listeners
function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    if (startBtn) startBtn.addEventListener('click', startSession);
    if (stopFindBtn) stopFindBtn.addEventListener('click', stopFindTimer);
    if (stopReviewBtn) stopReviewBtn.addEventListener('click', stopReviewTimer);
    if (newSessionBtn) newSessionBtn.addEventListener('click', resetToStart);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearHistory);
    if (downloadLogBtn) downloadLogBtn.addEventListener('click', downloadLogFile);
    if (exportCSVBtn) exportCSVBtn.addEventListener('click', exportToCSV);
    if (exportJSONBtn) exportJSONBtn.addEventListener('click', exportToJSON);
    
    console.log('✅ Event listeners set up');
}

// Start New Session
function startSession() {
    console.log('▶️ Starting new session...');
    
    if (sentences.length === 0) {
        alert('No sentences available! Please check sentences.xml');
        return;
    }

    // Get random sentence
    currentSentence = getRandomSentence();
    
    console.log('📝 Selected sentence:', currentSentence);
    
    // Display sentence
    sentenceDisplay.textContent = currentSentence;
    sentenceDisplayReview.textContent = currentSentence;
    
    // Switch to Find Timer screen
    showScreen('findTimer');
    
    // Start Find Timer
    startFindTimer();
}

// Get Random Sentence (No Repeats)
function getRandomSentence() {
    console.log('🎲 Getting random sentence...');
    
    // If all sentences have been used, reset the pool
    if (usedSentences.length >= sentences.length) {
        console.log('♻️ All sentences used, resetting pool...');
        usedSentences = [];
        alert('🎉 You\'ve completed all sentences! Starting fresh.');
    }
    
    // Get available sentences (not yet used)
    const availableSentences = sentences.filter(s => !usedSentences.includes(s));
    
    // Pick a random sentence from available ones
    const randomIndex = Math.floor(Math.random() * availableSentences.length);
    const selectedSentence = availableSentences[randomIndex];
    
    // Mark this sentence as used
    usedSentences.push(selectedSentence);
    
    console.log(`✅ Selected sentence (${usedSentences.length}/${sentences.length} used)`);
    console.log(`📝 Sentence: "${selectedSentence}"`);
    
    return selectedSentence;
}


// Start Find Timer
function startFindTimer() {
    console.log('⏱️ Starting Find Timer...');
    findStartTime = Date.now();
    findTimerInterval = setInterval(() => {
        const elapsed = Date.now() - findStartTime;
        updateTimerDisplay(findTimerDisplay, findMilliseconds, elapsed);
    }, 10);
}

// Stop Find Timer
function stopFindTimer() {
    console.log('⏹️ Stopping Find Timer...');
    if (findTimerInterval) {
        clearInterval(findTimerInterval);
        findTime = Date.now() - findStartTime;
        
        console.log('✅ Find Time:', formatTime(findTime));
        
        // Display find time
        document.getElementById('findTimeResult').textContent = formatTime(findTime);
        
        // Switch to Review Timer screen
        showScreen('reviewTimer');
        
        // Start Review Timer
        startReviewTimer();
    }
}

// Start Review Timer
function startReviewTimer() {
    console.log('⏱️ Starting Review Timer...');
    reviewStartTime = Date.now();
    reviewTimerInterval = setInterval(() => {
        const elapsed = Date.now() - reviewStartTime;
        updateTimerDisplay(reviewTimerDisplay, reviewMilliseconds, elapsed);
    }, 10);
}

// Stop Review Timer
function stopReviewTimer() {
    console.log('⏹️ Stopping Review Timer...');
    if (reviewTimerInterval) {
        clearInterval(reviewTimerInterval);
        reviewTime = Date.now() - reviewStartTime;
        
        console.log('✅ Review Time:', formatTime(reviewTime));
        
        // Show results
        showResults();
    }
}

// Show Results
function showResults() {
    console.log('📊 Showing results...');
    const totalTime = findTime + reviewTime;
    
    document.getElementById('resultSentence').textContent = currentSentence;
    document.getElementById('resultFindTime').textContent = formatTime(findTime);
    document.getElementById('resultReviewTime').textContent = formatTime(reviewTime);
    document.getElementById('resultTotalTime').textContent = formatTime(totalTime);
    
    // Create session data
    const sessionData = {
        sentence: currentSentence,
        findTime: findTime,
        reviewTime: reviewTime,
        totalTime: totalTime,
        timestamp: new Date().toISOString()
    };
    
    // Save to history
    saveToHistory(sessionData);
    
    // Show results screen
    showScreen('results');
}

// Show Screen
function showScreen(screenName) {
    console.log('🖥️ Switching to screen:', screenName);
    
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    
    // Show selected screen
    switch(screenName) {
        case 'start':
            startScreen.classList.add('active');
            break;
        case 'findTimer':
            findTimerScreen.classList.add('active');
            break;
        case 'reviewTimer':
            reviewTimerScreen.classList.add('active');
            break;
        case 'results':
            resultsScreen.classList.add('active');
            break;
    }
}

// Update Timer Display
function updateTimerDisplay(displayElement, millisecondsElement, elapsed) {
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = Math.floor((elapsed % 1000));
    
    displayElement.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    millisecondsElement.textContent = String(milliseconds).padStart(3, '0');
}

// Format Time
function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000));
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

// Save to History
function saveToHistory(sessionData) {
    console.log('💾 Saving to history...');
    sessionHistory.unshift(sessionData);
    
    // Keep only last 50 sessions
    if (sessionHistory.length > 50) {
        sessionHistory = sessionHistory.slice(0, 50);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('sessionHistory', JSON.stringify(sessionHistory));
        console.log('✅ Saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
    
    // Update history display
    displayHistory();
}

// Load History
function loadHistory() {
    console.log('📂 Loading history from localStorage...');
    try {
        const saved = localStorage.getItem('sessionHistory');
        if (saved) {
            sessionHistory = JSON.parse(saved);
            console.log(`✅ Loaded ${sessionHistory.length} sessions from history`);
            displayHistory();
        }
    } catch (error) {
        console.error('❌ Error loading history:', error);
        sessionHistory = [];
    }
}

// Display History
function displayHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (sessionHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999;">No sessions yet. Start your first session!</p>';
        return;
    }
    
    historyList.innerHTML = sessionHistory.map((session, index) => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-number">#${sessionHistory.length - index}</span>
                <span class="history-date">${new Date(session.timestamp).toLocaleString()}</span>
            </div>
            <div class="history-sentence">${session.sentence}</div>
            <div class="history-stats">
                <span><strong>Find:</strong> ${formatTime(session.findTime)}</span>
                <span><strong>Review:</strong> ${formatTime(session.reviewTime)}</span>
                <span><strong>Total:</strong> ${formatTime(session.totalTime)}</span>
            </div>
        </div>
    `).join('');
}

// Clear History
function clearHistory() {
    if (confirm('Are you sure you want to clear all session history? This cannot be undone.')) {
        console.log('🗑️ Clearing history...');
        sessionHistory = [];
        localStorage.removeItem('sessionHistory');
        displayHistory();
        alert('History cleared successfully!');
    }
}

// Reset to Start
function resetToStart() {
    console.log('🔄 Resetting to start screen...');
    
    // Clear timers
    if (findTimerInterval) clearInterval(findTimerInterval);
    if (reviewTimerInterval) clearInterval(reviewTimerInterval);
    
    // Reset variables
    currentSentence = '';
    findStartTime = null;
    reviewStartTime = null;
    findTime = 0;
    reviewTime = 0;
    
    // Reset displays
    findTimerDisplay.textContent = '00:00:00';
    reviewTimerDisplay.textContent = '00:00:00';
    findMilliseconds.textContent = '000';
    reviewMilliseconds.textContent = '000';
    
    // Show start screen
    showScreen('start');
}

// Download Log File
function downloadLogFile() {
    console.log('📥 Downloading log file...');
    
    if (sessionHistory.length === 0) {
        alert('No session history to download!');
        return;
    }
    
    let logContent = 'SENTENCE TIMER - SESSION LOG\n';
    logContent += '=' .repeat(80) + '\n';
    logContent += `Generated: ${new Date().toLocaleString()}\n`;
    logContent += `Total Sessions: ${sessionHistory.length}\n`;
    logContent += '=' .repeat(80) + '\n\n';
    
    sessionHistory.forEach((session, index) => {
        logContent += `SESSION #${sessionHistory.length - index}\n`;
        logContent += `-`.repeat(80) + '\n';
        logContent += `Date: ${new Date(session.timestamp).toLocaleString()}\n`;
        logContent += `Sentence: ${session.sentence}\n`;
        logContent += `Find Time: ${formatTime(session.findTime)}\n`;
        logContent += `Review Time: ${formatTime(session.reviewTime)}\n`;
        logContent += `Total Time: ${formatTime(session.totalTime)}\n`;
        logContent += '\n';
    });
    
    // Calculate statistics
    const avgFindTime = sessionHistory.reduce((sum, s) => sum + s.findTime, 0) / sessionHistory.length;
    const avgReviewTime = sessionHistory.reduce((sum, s) => sum + s.reviewTime, 0) / sessionHistory.length;
    const avgTotalTime = sessionHistory.reduce((sum, s) => sum + s.totalTime, 0) / sessionHistory.length;
    
    logContent += '=' .repeat(80) + '\n';
    logContent += 'STATISTICS\n';
    logContent += '=' .repeat(80) + '\n';
    logContent += `Average Find Time: ${formatTime(avgFindTime)}\n`;
    logContent += `Average Review Time: ${formatTime(avgReviewTime)}\n`;
    logContent += `Average Total Time: ${formatTime(avgTotalTime)}\n`;
    
    // Download file
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentence-timer-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Log file downloaded');
}

// Export to CSV
function exportToCSV() {
    console.log('📊 Exporting to CSV...');
    
    if (sessionHistory.length === 0) {
        alert('No session history to export!');
        return;
    }
    
    let csv = 'Session Number,Date,Time,Sentence,Find Time (ms),Review Time (ms),Total Time (ms),Find Time (formatted),Review Time (formatted),Total Time (formatted)\n';
    
    sessionHistory.forEach((session, index) => {
        const sessionNum = sessionHistory.length - index;
        const date = new Date(session.timestamp).toLocaleDateString();
        const time = new Date(session.timestamp).toLocaleTimeString();
        const sentence = `"${session.sentence.replace(/"/g, '""')}"`;
        
        csv += `${sessionNum},${date},${time},${sentence},${session.findTime},${session.reviewTime},${session.totalTime},${formatTime(session.findTime)},${formatTime(session.reviewTime)},${formatTime(session.totalTime)}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentence-timer-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV exported');
}

// Export to JSON
function exportToJSON() {
    console.log('📦 Exporting to JSON...');
    
    if (sessionHistory.length === 0) {
        alert('No session history to export!');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        totalSessions: sessionHistory.length,
        sessions: sessionHistory.map((session, index) => ({
            sessionNumber: sessionHistory.length - index,
            ...session
        }))
    };
    
    const json = JSON.stringify(exportData, null, 2);
    
    // Download JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentence-timer-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ JSON exported');
}

// Register Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered:', registration);
        } catch (error) {
            console.log('❌ Service Worker registration failed:', error);
        }
    }
}

// Setup Install Prompt
function setupInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💾 Install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button if you want to add one
        // For now, we'll just log it
    });
    
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA installed successfully');
        deferredPrompt = null;
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Space bar to stop timers
    if (e.code === 'Space') {
        e.preventDefault();
        if (findTimerScreen.classList.contains('active')) {
            stopFindTimer();
        } else if (reviewTimerScreen.classList.contains('active')) {
            stopReviewTimer();
        }
    }
    
    // Enter to start new session
    if (e.code === 'Enter' && startScreen.classList.contains('active')) {
        startSession();
    }
    
    // Escape to reset
    if (e.code === 'Escape') {
        if (confirm('Return to start screen?')) {
            resetToStart();
        }
    }
});

console.log('✅ app.js fully loaded and initialized');
