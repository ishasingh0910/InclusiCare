// InclusiCare V3 - Micro-Experience Logic

document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        const toggle = document.getElementById("theme-toggle");
        if (toggle) toggle.textContent = "☀️";
    }

    if (!localStorage.getItem("theme")) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            if (current === "dark") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "light");
                toggle.textContent = "🌙";
            }
            else {
                document.documentElement.setAttribute("data-theme", "dark");
                localStorage.setItem("theme", "dark");
                toggle.textContent = "☀️";
            }
        });
    }

    // --- Auth Check ---
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const userProfile = document.getElementById("user-profile");
    const userDisplayName = document.getElementById("user-display-name");
    const logoutBtn = document.getElementById("logout-btn");
    const greetingText = document.getElementById("greeting-text");

    const navLoginBtn = document.getElementById("nav-login-btn");

    if (token && userName) {
        if (userProfile) userProfile.classList.remove("hidden");
        if (userDisplayName) userDisplayName.textContent = `Hi, ${userName}`;
        if (greetingText) greetingText.textContent = `Welcome back, ${userName}.`;
        if (navLoginBtn) navLoginBtn.classList.add("hidden");
    } else {
        if (userProfile) userProfile.classList.add("hidden");
        if (navLoginBtn) navLoginBtn.classList.remove("hidden");
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            window.location.href = "login.html";
        });
    }

    // --- State ---
    const state = {
        journalTitle: localStorage.getItem('inclusicare_journal_title') || '',
        activeAudioKey: null,
        isPlaying: false,
        audioFadeInterval: null
    };

    // --- Conversation Modes ---
    let conversationMode = null;
    let distractionStep = 0;
    let distractionTopic = null;

    // --- SPA Navigation ---
    const pageSections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('[data-page], [data-link]');

    function navigateTo(pageId) {
        const activeSection = document.querySelector('.page-section.active');
        if (activeSection && activeSection.id !== pageId) {
            activeSection.style.opacity = 0;
            setTimeout(() => {
                activeSection.classList.remove('active');
                const nextSection = document.getElementById(pageId);
                if (nextSection) {
                    nextSection.classList.add('active');
                    setTimeout(() => { nextSection.style.opacity = 1; }, 50);
                }
            }, 400);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-link');
            if (pageId) {
                navigateTo(pageId);
                closeSideMenu();
            }
        });
    });

    // --- Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidePanel = document.querySelector('.side-panel');
    const closeMenuBtn = document.querySelector('.close-menu');
    const sidePanelOverlay = document.querySelector('.side-panel-overlay');

    function openSideMenu() { sidePanel.classList.add('open'); sidePanelOverlay.classList.add('show'); }
    function closeSideMenu() { sidePanel.classList.remove('open'); sidePanelOverlay.classList.remove('show'); }

    if (menuToggle) menuToggle.addEventListener('click', openSideMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeSideMenu);
    if (sidePanelOverlay) sidePanelOverlay.addEventListener('click', closeSideMenu);


    // --- Panic Button ---
    const panicBtn = document.getElementById('panic-btn');
    const panicOverlay = document.getElementById('panic-overlay');
    const closePanicBtn = document.getElementById('close-panic');
    const breathingText = document.getElementById('breathing-text');
    let breathingInterval = null;

    // Explicitly force state reset on load
    if (panicOverlay) panicOverlay.classList.add('hidden');
    const resetCrisisModal = document.getElementById('crisis-modal');
    if (resetCrisisModal) resetCrisisModal.classList.add('hidden');
    const resetMoodModal = document.getElementById('mood-modal');
    if (resetMoodModal) resetMoodModal.classList.add('hidden');
    const resetEmergencyModal = document.getElementById('emergency-modal');
    if (resetEmergencyModal) resetEmergencyModal.classList.add('hidden');

    if (panicBtn && panicOverlay) {
        panicBtn.addEventListener('click', () => {
            panicOverlay.classList.remove('hidden');
            startBreathingCycle();
        });

        closePanicBtn.addEventListener('click', () => {
            panicOverlay.classList.add('hidden');
            stopBreathingCycle();
        });
    }

    function startBreathingCycle() {
        if (breathingInterval) {
            clearInterval(breathingInterval);
        }
        let cycle = () => {
            if (breathingText) breathingText.innerText = "Inhale slowly...";
            setTimeout(() => {
                if (breathingText) breathingText.innerText = "Hold gently...";
                setTimeout(() => {
                    if (breathingText) breathingText.innerText = "Exhale...";
                    setTimeout(() => {
                        if (breathingText) breathingText.innerText = "Rest.";
                    }, 4800);
                }, 1200);
            }, 4800);
        };
        cycle();
        breathingInterval = setInterval(cycle, 12000);
    }

    function stopBreathingCycle() {
        if (breathingInterval) {
            clearInterval(breathingInterval);
            breathingInterval = null;
        }
        if (breathingText) breathingText.innerText = "Inhale...";
    }

    // --- AI Companion ---
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const crisisModal = document.getElementById('crisis-modal');
    const closeCrisisBtn = document.getElementById('close-crisis-modal');

    if (closeCrisisBtn && crisisModal) {
        closeCrisisBtn.addEventListener('click', () => {
            crisisModal.classList.add('hidden');
            // Also ensure panic is off if user clicks safe
            if (panicOverlay && !panicOverlay.classList.contains('hidden')) {
                panicOverlay.classList.add('hidden');
                stopBreathingCycle();
            }
        });
    }

    // =========================================================================
    // 🚨 EXPANDED SAFETY ENGINE: SYNONYMS, REGEX PATTERNS & REAL-TIME ALERTS
    // =========================================================================

    // --- 1. CRISIS & SUICIDAL REGEX PATTERNS & ALL SYNONYMS ---
    const crisisPatterns = [
        /\b(suicid|suicide|suicidal|sucide|suicde|suiside|seppuku)\b/i,
        /\b(die|dying|death|dead)\b/i,
        /\b(kill\s+myself|killing\s+myself|kill\s+me|murder\s+myself)\b/i,
        /\b(end\s+(my\s+life|it\s+all|everything|my\s+existence|this\s+pain))\b/i,
        /\b(take\s+my\s+(own\s+)?life)\b/i,
        /\b(hurt\s+myself|harm\s+myself|self\s*[- ]*harm|cut\s+myself|cutting\s+myself|slit\s+my(\s+wrists?)?)\b/i,
        /\b(overdose|od\s+on|poison\s+myself|hang\s+myself|hanging\s+myself|noose)\b/i,
        /\b(jump\s+(off|from)|drown\s+myself|shoot\s+myself|put\s+a\s+bullet)\b/i,
        /\b(wanna\s+die|want\s+to\s+die|wish\s+i\s+(was|were)\s+dead|rather\s+be\s+dead|better\s+off\s+dead)\b/i,
        /\b(no\s+(reason|point)\s+(to\s+live|in\s+living)|nothing\s+to\s+live\s+for|tired\s+of\s+living)\b/i,
        /\b(give\s+up\s+on\s+life|given\s+up\s+on\s+life|can'?t\s+go\s+on|cannot\s+go\s+on|goodbye\s+(cruel\s+)?world|goodbye\s+forever|last\s+goodbye)\b/i,
        /\b(don'?t\s+want\s+to\s+live|dont\s+want\s+to\s+live|not\s+worth\s+living|ready\s+to\s+die|done\s+with\s+life|want\s+to\s+disappear\s+forever)\b/i,
        /\b(can'?t\s+take\s+it\s+anymore|cannot\s+take\s+it\s+anymore|no\s+point\s+in\s+anything)\b/i
    ];

    // --- 2. ANXIETY & STRESS REGEX PATTERNS & ALL SYNONYMS ---
    const anxietyPatterns = [
        /\b(anxi|anxious|anxiety|anxiousness|angst)\b/i,
        /\b(stress|stressed|stressing|stressful|stressed\s+out)\b/i,
        /\b(tense|tensed|tension|tight\s+chest|chest\s+tight)\b/i,
        /\b(panic|panicking|panicked|panic\s+attack)\b/i,
        /\b(overwhelm|overwhelmed|overwhelming|overload)\b/i,
        /\b(freak|freaking|freaked)\s+out\b/i,
        /\b(nervous|nervousness|on\s+edge|jitter|jittery|jitters)\b/i,
        /\b(scared|frightened|terrified|petrified|fearful|fear)\b/i,
        /\b(shaking|trembling|hyperventilat|hyperventilating|sweating\s+from\s+fear)\b/i,
        /\b(can'?t\s+breathe|cannot\s+breathe|cant\s+breathe|hard\s+to\s+breathe|shortness\s+of\s+breath|suffocat|suffocating|choking)\b/i,
        /\b(heart\s+(is\s+)?racing|heart\s+pounding|rapid\s+heartbeat|palpitations?)\b/i,
        /\b(worried|worrying|worried\s+sick|worry|overthink|overthinking)\b/i,
        /\b(racing\s+thoughts|mind\s+(is\s+)?racing|head\s+(is\s+)?spinning)\b/i,
        /\b(spiral|spiraling|spiralling)\b/i,
        /\b(losing\s+(my\s+)?mind|losing\s+control|losing\s+it|breaking\s+down|breakdown|meltdown)\b/i,
        /\b(uneasy|restless|restlessness|agitat|agitated|agitation)\b/i,
        /\b(dread|dreading|impending\s+doom|doom)\b/i,
        /\b(too\s+much\s+pressure|under\s+pressure|can'?t\s+cope|cannot\s+cope|can'?t\s+handle|cant\s+take\s+this)\b/i,
        /\b(paralyzed\s+with\s+fear|frozen\s+with\s+fear|claustrophobic)\b/i
    ];

    function isCrisisMatch(text) {
        return crisisPatterns.some(rx => rx.test(text));
    }

    function isAnxietyMatch(text) {
        return anxietyPatterns.some(rx => rx.test(text));
    }

    // --- High-Intensity Emergency Police/Ambulance Style Audio Siren ---
    let emergencyAudioCtx = null;
    let sirenOsc = null;
    let sirenGain = null;

    function playEmergencyAlert() {
        try {
            stopEmergencyAlert();
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            emergencyAudioCtx = new AudioCtx();
            if (emergencyAudioCtx.state === 'suspended') {
                emergencyAudioCtx.resume();
            }

            sirenOsc = emergencyAudioCtx.createOscillator();
            sirenGain = emergencyAudioCtx.createGain();
            sirenOsc.type = 'sawtooth'; // Piercing siren timbre

            sirenOsc.connect(sirenGain);
            sirenGain.connect(emergencyAudioCtx.destination);

            const now = emergencyAudioCtx.currentTime;
            sirenGain.gain.setValueAtTime(0.35, now);

            // Wailing siren oscillating between 650Hz and 1050Hz (5 seconds)
            const cycleDuration = 0.8;
            const cycles = 6;
            for (let i = 0; i < cycles; i++) {
                const start = now + (i * cycleDuration);
                const mid = start + (cycleDuration / 2);
                const end = start + cycleDuration;
                sirenOsc.frequency.setValueAtTime(650, start);
                sirenOsc.frequency.linearRampToValueAtTime(1050, mid);
                sirenOsc.frequency.linearRampToValueAtTime(650, end);
            }

            sirenGain.gain.setValueAtTime(0.35, now + (cycles * cycleDuration) - 0.3);
            sirenGain.gain.linearRampToValueAtTime(0, now + (cycles * cycleDuration));

            sirenOsc.start(now);
            sirenOsc.stop(now + (cycles * cycleDuration) + 0.1);
        } catch (e) {
            console.warn('Audio alert siren error:', e);
        }
    }

    function stopEmergencyAlert() {
        try {
            if (sirenOsc) {
                sirenOsc.stop();
                sirenOsc.disconnect();
                sirenOsc = null;
            }
            if (emergencyAudioCtx) {
                emergencyAudioCtx.close();
                emergencyAudioCtx = null;
            }
        } catch (e) {}
    }

    // --- Emergency Modal Controls ---
    const emergencyModal = document.getElementById('emergency-modal');
    const closeEmergencyBtn = document.getElementById('close-emergency-modal');

    if (closeEmergencyBtn && emergencyModal) {
        closeEmergencyBtn.addEventListener('click', () => {
            emergencyModal.classList.add('hidden');
            stopEmergencyAlert();
        });
    }

    function triggerEmergencyAlert() {
        if (emergencyModal) emergencyModal.classList.remove('hidden');
        playEmergencyAlert();
        if (crisisModal) crisisModal.classList.remove('hidden');
    }

    function triggerSOSOverlay() {
        if (panicOverlay) {
            panicOverlay.classList.remove('hidden');
            startBreathingCycle();
        }
    }

    function checkAndFireAlert(text) {
        const isCrisis = isCrisisMatch(text);
        const isAnxious = !isCrisis && isAnxietyMatch(text);
        if (isCrisis) triggerEmergencyAlert();
        else if (isAnxious) triggerSOSOverlay();
        return { isCrisis, isAnxious };
    }

    // --- Real-time as-you-type detection ---
    let _alertFiredForCurrentInput = false;
    if (userInput) {
        userInput.addEventListener('input', () => {
            if (_alertFiredForCurrentInput) return;
            const text = userInput.value.trim();
            if (!text || text.length < 3) return;
            const isCrisis = isCrisisMatch(text);
            const isAnxious = !isCrisis && isAnxietyMatch(text);
            if (isCrisis || isAnxious) {
                checkAndFireAlert(text);
                _alertFiredForCurrentInput = true;
            }
        });
        userInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') _alertFiredForCurrentInput = false;
        });
    }

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
        msgDiv.innerText = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    let lastBotResponses = [];

    function handleUserInput() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';
        _alertFiredForCurrentInput = false;

        const lowerText = text.toLowerCase();

        // --- Distraction Mode ---
        if (conversationMode === "distraction") {
            handleDistractionFlow(lowerText);
            return;
        }
        if (lowerText.includes("distraction")) {
            startDistractionMode();
            return;
        }

        // --- INSTANT alert on send (no delay) ---
        const { isCrisis, isAnxious } = checkAndFireAlert(lowerText);

        // Bot message reply (short natural delay)
        setTimeout(() => {
            if (isCrisis) {
                addMessage("I hear you and I'm so glad you told me. Please reach out to one of the emergency contacts shown. You are not alone — help is here right now. 💙", false);
            } else if (isAnxious) {
                addMessage("It sounds like things feel really overwhelming. I've opened the breathing exercise — let's slow down together. 🌿", false);
            } else {
                const response = getWarmEmpatheticResponse(lowerText);
                simulateTyping(response, (finalText) => {
                    addMessage(finalText, false);
                });
            }
        }, 700);
    }

    function getWarmEmpatheticResponse(text) {

        const emotionalTone = {
            anxious: [
                "Hey… slow down a little with me. You’re okay right now.",
                "That anxious spiral can feel loud. Let’s shrink it together.",
                "I’m here. You don’t have to face that feeling alone."
            ],
            sad: [
                "That sounds heavy… I’m really glad you told me.",
                "It hurts, doesn’t it? I’m sitting with you.",
                "You don’t have to be strong here. You can just be."
            ],
            overwhelmed: [
                "That’s a lot to carry. No wonder you're tired.",
                "Pause with me for a second. Just breathe.",
                "One thing at a time. We don’t solve everything tonight."
            ],
            default: [
                "Tell me more. I’m really listening.",
                "I’m here with you. What’s been weighing on you?",
                "You matter here. Say what’s on your mind."
            ]
        };

        let category = "default";

        if (/anx|panic|nervous|stress/.test(text)) category = "anxious";
        else if (/sad|cry|lonely|empty/.test(text)) category = "sad";
        else if (/tired|overwhelmed|exhausted|too much/.test(text)) category = "overwhelmed";

        let responses = emotionalTone[category];

        let response = responses[Math.floor(Math.random() * responses.length)];

        // Prevent repetition (last 3 responses)
        while (lastBotResponses.includes(response) && responses.length > 1) {
            response = responses[Math.floor(Math.random() * responses.length)];
        }

        lastBotResponses.push(response);
        if (lastBotResponses.length > 3) lastBotResponses.shift();

        return response;
    }

    function simulateTyping(text, callback) {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.innerText = "typing...";
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            callback(text);
        }, 800 + Math.random() * 1200);
    }

    function startDistractionMode() {
        conversationMode = "distraction";
        distractionStep = 0;
        distractionTopic = null;

        simulateTyping("Alright. Let’s shift the mood a little 🌿", () => {
            addMessage(
                "Quick pick: Would you rather\n🏖 Live by the beach\n🌲 Or in a quiet mountain cabin?",
                false
            );
        });
    }

    function handleDistractionFlow(text) {

        if (distractionStep === 0) {

            if (text.includes("beach")) {
                distractionTopic = "beach";
                distractionStep = 1;

                simulateTyping("Beach energy? I like that.", () => {
                    addMessage("Sunrise walks or midnight ocean vibes?", false);
                });

            } else if (text.includes("mountain") || text.includes("cabin")) {
                distractionTopic = "mountain";
                distractionStep = 1;

                simulateTyping("Mountain soul. Calm and mysterious.", () => {
                    addMessage("Hot chocolate by fireplace or silent long hikes?", false);
                });

            } else {
                simulateTyping("Hmm… beach or mountains?", () => {
                    addMessage("Pick one. This is serious research 😌", false);
                });
            }

            return;
        }

        if (distractionStep === 1) {

            distractionStep = 2;

            simulateTyping("You know what that says about you?", () => {

                if (distractionTopic === "beach") {
                    addMessage(
                        "You crave warmth and breathing space. That’s kind of beautiful.",
                        false
                    );
                } else {
                    addMessage(
                        "You like depth and quiet reflection. That’s powerful energy.",
                        false
                    );
                }

                setTimeout(() => {
                    addMessage("Final choice: want a silly joke or a mini imagination game?", false);
                }, 700);
            });

            return;
        }

        if (distractionStep === 2) {

            if (text.includes("joke")) {
                tellRandomJoke();
            } else {
                startImaginationGame();
            }

            resetDistractionMode();
        }
    }

    function tellRandomJoke() {

        const jokes = [
            "Why don’t programmers like nature? Too many bugs.",
            "Why did the scarecrow win an award? He was outstanding in his field.",
            "Why don’t skeletons fight each other? They don’t have the guts.",
            "What do you call fake spaghetti? An impasta."
        ];

        const joke = jokes[Math.floor(Math.random() * jokes.length)];

        simulateTyping("Okay serious face…", () => {
            addMessage(joke, false);
        });
    }

    function startImaginationGame() {
        simulateTyping("Close your eyes for five seconds.", () => {
            addMessage(
                "Imagine you're somewhere peaceful. No expectations. Just steady air and calm breathing.",
                false
            );
        });
    }

    function resetDistractionMode() {
        conversationMode = null;
        distractionStep = 0;
        distractionTopic = null;
    }

    if (sendBtn && userInput) {
        sendBtn.addEventListener('click', handleUserInput);
        userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserInput(); });
    }

    window.sendQuickReply = function (text) {
        if (userInput) {
            userInput.value = text;
            if (sendBtn) sendBtn.click();
        }
    };

    // --- Smart Journaling ---
    const journalEntry = document.getElementById('journal-entry');
    const saveJournalBtn = document.getElementById('save-journal');
    const pastEntriesContainer = document.getElementById('past-entries');
    const journalTitleInput = document.getElementById('journal-title-input');

    if (journalTitleInput) {
        journalTitleInput.value = state.journalTitle;
        journalTitleInput.addEventListener('change', (e) => {
            state.journalTitle = e.target.value.trim();
            localStorage.setItem('inclusicare_journal_title', state.journalTitle);
        });
    }

    if (saveJournalBtn) {
        saveJournalBtn.addEventListener('click', () => {
            const entryText = journalEntry.value.trim();
            if (!entryText) return;

            const selectedMoodInput = document.querySelector('input[name="j-mood"]:checked');
            const selectedMood = selectedMoodInput ? selectedMoodInput.value : "none";
            const moodLabel = selectedMoodInput ? selectedMoodInput.nextElementSibling.innerText : "";

            const newEntry = {
                id: Date.now(),
                date: new Date().toLocaleDateString(),
                text: entryText,
                mood: selectedMood,
                moodLabel: moodLabel
            };

            const existingEntries = JSON.parse(localStorage.getItem('inclusicare_journal_v3')) || [];
            existingEntries.unshift(newEntry);
            localStorage.setItem('inclusicare_journal_v3', JSON.stringify(existingEntries));

            journalEntry.value = '';
            document.querySelectorAll('input[name="j-mood"]').forEach(r => r.checked = false);

            // Re-use mood modal for journal saving feedback to save space/code
            const moodModal = document.getElementById('mood-modal');
            if (moodModal) {
                moodModal.querySelector('h3').innerText = "Thought saved securely.";
                moodModal.classList.remove('hidden');
                setTimeout(() => moodModal.classList.add('hidden'), 2000);
            }

            loadJournalEntries();
        });
    }

    function loadJournalEntries() {
        if (!pastEntriesContainer) return;
        pastEntriesContainer.innerHTML = '';
        const entries = JSON.parse(localStorage.getItem('inclusicare_journal_v3')) || [];

        if (entries.length === 0) {
            pastEntriesContainer.innerHTML = '<p style="color: grey; font-style: italic; font-size: 0.9rem;">Your safe pages are empty.</p>';
            return;
        }

        entries.forEach(entry => {
            const div = document.createElement('div');
            div.classList.add('journal-entry');
            div.style.background = 'rgba(255,255,255,0.4)';
            div.style.padding = '12px';
            div.style.borderRadius = '10px';
            div.style.fontSize = '0.9rem';

            let moodTagHtml = '';
            if (entry.mood && entry.mood !== 'none') {
                moodTagHtml = `<span class="entry-mood mood-${entry.mood}">${entry.moodLabel}</span>`;
            }

            div.innerHTML = `
                <div class="entry-header">
                    <strong class="entry-date">${entry.date}</strong>
                    ${moodTagHtml}
                </div>
                <p class="entry-text" style="margin-top:4px;">${entry.text}</p>
            `;
            pastEntriesContainer.appendChild(div);
        });

        renderMoodInsights(entries);
    }

    // Insights Modal Logic
    const insightsBtn = document.getElementById("view-insights-btn");
    const insightsModal = document.getElementById("insights-modal");
    const closeInsightsBtn = document.getElementById("close-insights");

    if (insightsBtn && insightsModal && closeInsightsBtn) {
        insightsBtn.addEventListener("click", () => {
            const entries = JSON.parse(localStorage.getItem('inclusicare_journal_v3')) || [];
            renderMoodInsights(entries);
            insightsModal.classList.remove("hidden");
        });

        closeInsightsBtn.addEventListener("click", () => {
            insightsModal.classList.add("hidden");
        });
    }

    function renderMoodInsights(entries) {
        const insightsContainer = document.getElementById('insights-modal');
        if (!insightsContainer) return;

        const entriesWithMood = entries.filter(e => e.mood && e.mood !== 'none');
        if (entriesWithMood.length === 0) {
            return;
        }

        // 1. Most common mood
        const moodCounts = {};
        entriesWithMood.forEach(e => {
            moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        });

        const mostCommonMoodKey = Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b);
        const mostCommonEntry = entriesWithMood.find(e => e.mood === mostCommonMoodKey);
        const mostCommonLabel = mostCommonEntry ? mostCommonEntry.moodLabel : mostCommonMoodKey;

        document.getElementById('insight-most-mood').textContent = mostCommonLabel;

        // 2. Entries written (Total)
        document.getElementById('insight-entry-count').textContent = entries.length;

        // 3. Emotional balance
        const positiveMoods = ['happy', 'calm', 'hopeful', 'grateful', 'motivated'];
        const difficultMoods = ['sad', 'anxious', 'stressed', 'overwhelmed', 'lonely', 'angry'];

        let positiveCount = 0;
        let difficultCount = 0;

        entriesWithMood.forEach(e => {
            if (positiveMoods.includes(e.mood)) positiveCount++;
            if (difficultMoods.includes(e.mood)) difficultCount++;
        });

        let balanceText = "Your emotional entries show a healthy balance.";
        if (positiveCount > difficultCount) {
            balanceText = "You've experienced more positive emotions recently 🌱";
        } else if (difficultCount > positiveCount) {
            balanceText = "You’ve had several challenging emotions lately. Be gentle with yourself.";
        }

        document.getElementById('insight-balance').textContent = balanceText;

        // 4. Mini Mood Chart
        const chartContainer = document.getElementById('mood-frequency-chart');
        if (chartContainer) {
            chartContainer.innerHTML = '';
            const maxCount = Math.max(...Object.values(moodCounts));

            const sortedMoods = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a]).slice(0, 6);

            sortedMoods.forEach(mood => {
                const count = moodCounts[mood];
                const heightPercent = Math.max((count / maxCount) * 100, 10);

                const barContainer = document.createElement('div');
                barContainer.className = 'chart-bar-container';

                const entry = entriesWithMood.find(e => e.mood === mood);
                const emoji = entry ? entry.moodLabel.split(' ')[0] : '';

                barContainer.innerHTML = `<div class="chart-bar mood-${mood}" style="height: ${heightPercent}%"></div><span class="chart-label">${emoji}</span>`;
                chartContainer.appendChild(barContainer);
            });
        }
    }

    loadJournalEntries();

    // --- Wellbeing Tracker ---
    const moodSlider = document.getElementById('mood-slider');
    const moodValue = document.getElementById('mood-value');
    const logMoodBtn = document.getElementById('log-mood');
    const moodChart = document.getElementById('mood-chart');
    const toast = document.getElementById("mood-toast");

    function getMoodLabel(val) {
        if (val <= 20) return "Very Low";
        if (val <= 40) return "Low";
        if (val <= 60) return "Neutral";
        if (val <= 80) return "Good";
        return "Very Good";
    }

    function getLocalTodayDate() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year} -${month} -${day} `;
    }

    function showToast() {
        if (!toast) return;
        toast.classList.remove("hidden");
        // Force reflow so transition works
        void toast.offsetWidth;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toast.classList.add("hidden");
            }, 400);
        }, 1500);
    }

    if (moodSlider && moodValue) {
        moodSlider.addEventListener('input', (e) => {
            moodValue.innerText = getMoodLabel(parseInt(e.target.value));
        });
        moodValue.innerText = getMoodLabel(parseInt(moodSlider.value));
    }

    if (logMoodBtn) {
        logMoodBtn.addEventListener('click', () => {
            if (!moodSlider) return;
            const mood = parseInt(moodSlider.value);
            let moods = {};
            try {
                const stored = JSON.parse(localStorage.getItem('inclusicare_moods'));
                if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
                    moods = stored;
                }
            } catch (e) { }

            moods[getLocalTodayDate()] = mood;
            localStorage.setItem('inclusicare_moods', JSON.stringify(moods));

            renderMoodChart();
            showToast();
        });
    }

    function renderMoodChart() {
        if (!moodChart) return;
        moodChart.innerHTML = '';

        const axisContainer = document.getElementById('mood-chart-axis');
        if (axisContainer) axisContainer.innerHTML = '';

        let moods = {};
        try {
            const stored = JSON.parse(localStorage.getItem('inclusicare_moods'));
            if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
                moods = stored;
            }
        } catch (e) { }

        if (Object.keys(moods).length === 0) {
            moodChart.innerHTML = "<p style='opacity:0.6;font-size:0.9rem'>No mood recorded yet.</p>";
            return;
        }

        const chartDays = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year} -${month} -${day} `;

            chartDays.push({
                date: dateStr,
                val: moods[dateStr] !== undefined ? moods[dateStr] : null,
                isToday: i === 0,
                shortDate: `${month}/${day}`,
                dayOfWeek: d.getDay()
            });
        }

        chartDays.forEach((dayData) => {
            const barContainer = document.createElement('div');
            barContainer.classList.add('chart-bar-container');

            const tooltip = document.createElement('div');
            tooltip.classList.add('chart-tooltip');
            tooltip.innerText = `${dayData.shortDate} - ${getMoodLabel(dayData.val)}`;

            const bar = document.createElement('div');
            bar.classList.add('chart-bar');
            if (dayData.isToday) {
                bar.classList.add('today-bar');
            }

            const colors = [
                "#e63946",  // 1 very low
                "#e76f51",  // 2
                "#f4a261",  // 3
                "#e9c46a",  // 4
                "#d4d97a",  // 5 neutral
                "#a8d5ba",  // 6
                "#7fbf7f",  // 7
                "#52b788",  // 8
                "#2a9d8f",  // 9
                "#1b7f79"   // 10 excellent
            ];

            if (dayData.val === null) {

                // No mood logged → no bar
                bar.style.height = "0%";
                bar.style.background = "transparent";
                bar.title = "No mood logged";

            } else {

                let colorIndex = Math.floor(dayData.val / 10);
                if (colorIndex >= colors.length) colorIndex = colors.length - 1;

                bar.style.background = colors[colorIndex];

                bar.style.height = '0%';
                setTimeout(() => {
                    bar.style.height = `${dayData.val * 1.2}%`;
                }, 50);

                bar.title = `Mood level: ${dayData.val}`;

            }

            barContainer.appendChild(bar);
            barContainer.appendChild(tooltip);
            moodChart.appendChild(barContainer);

            if (axisContainer) {
                const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                const label = document.createElement('div');
                label.className = 'axis-label';
                label.innerText = dayNames[dayData.dayOfWeek];
                axisContainer.appendChild(label);
            }
        });
    }
    renderMoodChart();

    // --- Soundscapes logic ---
    const soundButtons = document.querySelectorAll('[data-sound]'); // Grabs both page and floating buttons
    const soundscapeToggleBtn = document.getElementById('soundscape-toggle-btn');
    const soundscapePanel = document.getElementById('soundscape-panel');

    // Explicitly initialize Audio properly with a constructor to handle cross-origin/playback policies
    const audioPlayer = new Audio();
    audioPlayer.crossOrigin = "anonymous";
    audioPlayer.loop = true;
    audioPlayer.volume = 0; // start silent

    const soundConfigs = {
        rain: {
            url: "sounds/rain.mp3",
            icon: '🌧️',
            name: "Gentle Rain"
        },
        forest: {
            url: "sounds/forest.mp3",
            icon: '🌲',
            name: "Forest"
        },
        waves: {
            url: "sounds/waves.mp3",
            icon: '🌊',
            name: "Waves"
        },
        whiteNoise: {
            url: "sounds/whitenoise.mp3",
            icon: '📻',
            name: "White Noise"
        }
    };

    // Floating Panel Toggle Logic
    if (soundscapeToggleBtn && soundscapePanel) {
        soundscapeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.isPlaying) {
                // Stop playing if it's currently "Happily Quiet"
                fadeOutAudio(() => {
                    state.isPlaying = false;
                    state.activeAudioKey = null;
                    updateAudioUI();
                });
            } else {
                // Toggle panel
                soundscapePanel.classList.toggle('hidden');
            }
        });

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!soundscapePanel.contains(e.target) && !soundscapeToggleBtn.contains(e.target)) {
                soundscapePanel.classList.add('hidden');
            }
        });
    }

    function crossFadeTo(configKey) {
        const targetUrl = soundConfigs[configKey].url;
        const icon = soundConfigs[configKey].icon;

        // If something is already playing, fade it out first
        if (state.isPlaying) {
            fadeOutAudio(() => {
                playNewTrack(targetUrl, configKey, icon);
            });
        } else {
            playNewTrack(targetUrl, configKey, icon);
        }
    }

    function playNewTrack(url, key, icon) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;

        audioPlayer.src = url;
        audioPlayer.volume = 0;

        // Handle autoplay block gracefully (promises!)
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                state.activeAudioKey = key;
                fadeInAudio();
                updateAudioUI(icon, key);
                if (soundscapePanel) soundscapePanel.classList.add('hidden'); // Close panel when playing starts
            }).catch(error => {
                console.warn("Audio play failed (maybe autoplay blocked):", error);
                state.isPlaying = false;
                updateAudioUI(null, null);
            });
        }
    }

    function fadeOutAudio(callback) {
        clearInterval(state.audioFadeInterval);
        state.audioFadeInterval = setInterval(() => {
            if (audioPlayer.volume > 0.05) {
                audioPlayer.volume -= 0.05;
            } else {
                audioPlayer.volume = 0;
                audioPlayer.pause();
                clearInterval(state.audioFadeInterval);
                if (callback) callback();
            }
        }, 50); // fast fade down
    }

    function fadeInAudio() {
        clearInterval(state.audioFadeInterval);
        state.audioFadeInterval = setInterval(() => {
            if (audioPlayer.volume < 0.8) {
                audioPlayer.volume += 0.05;
            } else {
                clearInterval(state.audioFadeInterval);
            }
        }, 50); // fast fade up
    }

    function updateAudioUI(icon, activeKey) {
        if (state.isPlaying) {
            if (soundscapeToggleBtn) {
                soundscapeToggleBtn.innerText = "Happily Quiet";
                soundscapeToggleBtn.classList.add('active'); // Optional styling
            }
        } else {
            if (soundscapeToggleBtn) {
                soundscapeToggleBtn.innerText = "Soundscapes";
                soundscapeToggleBtn.classList.remove('active');
            }
        }

        // Update active states on buttons
        soundButtons.forEach(btn => {
            if (btn.getAttribute('data-sound') === state.activeAudioKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Bind Sound Buttons
    soundButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const soundKey = btn.getAttribute('data-sound');

            // If clicking the active one, toggle it off
            if (state.activeAudioKey === soundKey && state.isPlaying) {
                fadeOutAudio(() => {
                    state.isPlaying = false;
                    state.activeAudioKey = null;
                    updateAudioUI(null, null);
                });
            } else {
                crossFadeTo(soundKey);
            }
        });
    });

    // --- Affirmations ---
    const affirmationText = document.getElementById('daily-affirmation');
    if (affirmationText) {
        const affirmations = [
            "You are enough just as you are.",
            "This feeling is temporary.",
            "You are allowed to take up space.",
            "Breathe. You are safe here."
        ];
        affirmationText.innerText = affirmations[Math.floor(Math.random() * affirmations.length)] || affirmations[0];
    }
});