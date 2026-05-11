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

    const crisisKeywords = ['kill', 'die', 'suicide', 'hurt myself', 'end it', 'death'];

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

        const lowerText = text.toLowerCase();
        // --- Distraction Mode Trigger ---
        if (conversationMode === "distraction") {
            handleDistractionFlow(lowerText);
            return;
        }

        if (lowerText.includes("distraction")) {
            startDistractionMode();
            return;
        }

        const isCrisis = crisisKeywords.some(keyword => lowerText.includes(keyword));


        const delay = 1000 + Math.random() * 1500;

        setTimeout(() => {
            if (isCrisis) {
                if (crisisModal) crisisModal.classList.remove('hidden');
                addMessage("That sounds really serious. Please check the resources above. You deserve support.", false);
            } else {
                const response = getWarmEmpatheticResponse(lowerText);
                simulateTyping(response, (finalText) => {
                    addMessage(finalText, false);
                });
            }
        }, delay);
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