const ballElement = document.getElementById("ball");
const gameElement = document.getElementById("game");
const scoreElement = document.getElementById("score-value");
const speedMeterElement = document.getElementById("speed-meter");
const speedValueElement = document.getElementById("speed-value");
const speedFillElement = document.getElementById("speed-fill");
const statusElement = document.getElementById("status");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const bossResultElement = document.getElementById("boss-result");
const bossResultTitleElement = document.getElementById("boss-result-title");
const bossResultScoreElement = document.getElementById("boss-result-score");
const bossResultNoMissBonusElement = document.getElementById("boss-result-no-miss-bonus");
const bossResultBonusElement = document.getElementById("boss-result-bonus");
const bossResultTotalElement = document.getElementById("boss-result-total");
const bossResultRetryButton = document.getElementById("boss-result-retry");
const bossResultTitleButton = document.getElementById("boss-result-title-button");
const restartButton = document.getElementById("restart");
const pauseMenuElement = document.getElementById("pause-menu");
const menuToggleButton = document.getElementById("menu-toggle");
const resumeButton = document.getElementById("resume");
const menuRestartButton = document.getElementById("menu-restart");
const pauseTitleButton = document.getElementById("pause-title");
const gameOverTitleButton = document.getElementById("game-over-title");
const bgmElement = document.getElementById("bgm");
const meteorClashSound = document.getElementById("meteor-clash-sound");
const cometClashSound = document.getElementById("comet-clash-sound");
const meteorAbsorbedSound = document.getElementById("meteor-absorbed-sound");
const titleScreenElement = document.getElementById("title-screen");
const bossHudElement = document.getElementById("boss-hud");
const bossMeteorElement = document.getElementById("boss-meteor");
const bossBurstElement = document.getElementById("boss-burst");
const bossImpactSurfaceElement = document.getElementById("boss-impact-surface");
const bossTimeValueElement = document.getElementById("boss-time-value");
const bossHealthValueElement = document.getElementById("boss-health-value");
const bossHealthFillElement = document.getElementById("boss-health-fill");
const bossAnnouncementElement = document.getElementById("boss-announcement");
const openBossAttackButton = document.getElementById("open-boss-attack");
const bossBgmElement = document.getElementById("boss-bgm");

const earthRadius = 40;
const meteorRadius = 14;
const projectileRadius = 5;
const attackSpeed = 5;
const maxScoreSpeed = 50.0;
const multiHitBonus = 0.25;
const spring = 0.03;
const damping = 0.12;
const bossMaxHealth = 40000;
const bossAttackDuration = 120000;
const bossTimePenalty = 5000;
const bossGiantTimePenalty = 10000;
const bossSplitGiantTimePenalty = 10000;
const bossSplitFragmentTimePenalty = 5000;
const bossGravityWaveTimePenalty = 15000;
const bossSplitUnlockHealthRatio = 0.95;
const bossSplitFiveFragmentHealthRatio = 0.5;
const bossFastAttackUnlockHealthRatio = 0.7;
const bossFastAttackDoubleCountHealthRatio = 0.3;
const bossGravityWaveUnlockHealthRatio = 0.5;
const bossGravityWaveRadius = 48;
const bossGravityWaveInfluenceRadius = 260;
const bossGravityWaveMeteorInterval = 425;
const bossGravityWaveSpawnJitter = 0.36;
const bossGravityWaveWarningDuration = 900;
const bossGravityWaveDuration = 5000;
const bossGiantAttackMinimumInterval = 5;
const bossGiantAttackMaximumInterval = 6;
const bossGiantRadius = earthRadius * 1.5;
const bossGiantApproachSpeed = 2.4;
const bossGiantReturnSpeed = 2.8;
const bossGiantReturnSpeedMultiplier = 1.5;
const bossGiantKnockbackSpeed = 9;
const bossGiantBackdropDuration = 900;
const bossSplitWarningDuration = 850;
const bossSplitApproachDuration = 1100;
const bossSplitFragmentCollisionDelay = 300;
const bossSplitTargetInsetRatio = 0.12;
const bossTimeBonusPerSecond = 5000;
const bossNoMissScoreMultiplier = 1.2;
const meteorDefinitions = [
    {
        id: "comet",
        spawnChance: 0.005,
        speed: 2.2,
        scoreMultiplier: 1,
        movement: "straight",
        clearsScreen: true
    },
    {
        id: "green",
        minScore: 5000,
        spawnChance: 0.02,
        approachSpeed: 1.5,
        orbitSpeed: 0.012,
        scoreMultiplier: 5,
        movement: "spiral",
        despawnMargin: 600
    },
    {
        id: "magenta",
        minScore: 10000,
        spawnChance: 0.08,
        speed: 1.35,
        scoreMultiplier: 3,
        movement: "off-center"
    },
    {
        id: "orange",
        minScore: 20000,
        spawnChance: 0.04,
        speed: 16.0,
        scoreMultiplier: 10,
        movement: "targeted",
        launchDelay: 1000,
        warning: true,
        spawnMargin: 120,
        despawnMargin: 180
    },
    {
        id: "silver",
        minScore: 25000,
        spawnChance: 0.01,
        speed: 2.8,
        scoreMultiplier: 2,
        movement: "tracking-cycle"
    },
    {
        id: "red",
        minScore: 15000,
        spawnChance: 0.04,
        speed: 1.35,
        scoreMultiplier: 4,
        movement: "off-center",
        projectileSpeed: 2.0
    },
    {
        id: "purple",
        minScore: 30000,
        spawnChance: 0.01,
        speed: 2.0,
        scoreMultiplier: 1,
        movement: "straight",
        sizeMultiplier: 1.5
    },
    {
        id: "normal",
        speed: 2.2,
        scoreMultiplier: 1,
        movement: "straight"
    }
];
const ball = { x: 0, y: 0, vx: 0, vy: 0, dragging: false, keyboardGrabbed: false };
const anchor = { x: 0, y: 0 };
const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const maxMeterSpeed = 12;

let meteors = [];
let projectiles = [];
let bossHazards = [];
let purpleEffects = [];
let afterimages = [];
let scorePopups = [];
let explosions = [];
let score = 0;
let gameOver = false;
let paused = false;
let gameStarted = false;
let gameMode = "endless";
let bossPauseOpenedThisRun = false;
let bossHealth = bossMaxHealth;
let bossTimeRemaining = bossAttackDuration;
let bossMotionTime = 0;
let bossAttacksSinceGiant = 0;
let bossGiantAttackInterval = bossGiantAttackMinimumInterval;
let bossGiantAttackInProgress = false;
let bossWasHit = false;
let bossAnnouncementRemaining = 0;
let bossLastCountdownSecond = null;
let bossThirtySecondAlertShown = false;
let gameOverTimeoutId = null;
let bossSequenceTimeoutIds = [];
let animationFrameId = null;
let lastTime = performance.now();
let spawnTimer = 0;
let nextSpawn = 900;
let afterimageTimer = 0;
let attackHitCount = 0;
let attackActive = false;
let bgmAudioContext = null;
let bgmSource = null;
let currentBgmElement = null;
let bgmUsingElement = false;
let bgmRequestId = 0;
let bgmFadeIntervalId = null;
let bgmFadeRequestId = 0;
let bgmGainNode = null;
let soundEffectsGainNode = null;
const audioBuffers = new Map();
const audioBufferPromises = new Map();
let bgmVolume = 0.5;
let soundEffectsVolume = 0.7;
const bgmLoopStartSeconds = 0;
const bgmLoopEndSeconds = null;

function playSound(soundElement) {
    const buffer = audioBuffers.get(soundElement.id);
    if (buffer && soundEffectsGainNode && bgmAudioContext) {
        const source = bgmAudioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(soundEffectsGainNode);
        source.start();
        return;
    }

    const sound = soundElement.cloneNode();
    sound.volume = soundEffectsVolume;
    sound.play().catch(() => {});
}

function animateBossDamage() {
    bossMeteorElement.classList.remove("is-damaged");
    void bossMeteorElement.offsetWidth;
    bossMeteorElement.classList.add("is-damaged");
}

function animateEarthDamage() {
    ballElement.classList.remove("is-damaged");
    void ballElement.offsetWidth;
    ballElement.classList.add("is-damaged");
}

function showDamagePopup(x, y, penalty = bossTimePenalty) {
    const element = document.createElement("div");
    element.className = "score-popup damage-popup";
    element.textContent = `-${penalty / 1000}s`;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    gameElement.appendChild(element);

    const popup = { element, timeoutId: null };
    popup.timeoutId = setTimeout(() => {
        element.remove();
        scorePopups = scorePopups.filter((current) => current !== popup);
    }, 700);
    scorePopups.push(popup);
}

function clearBossSequenceTimeouts() {
    bossSequenceTimeoutIds.forEach(clearTimeout);
    bossSequenceTimeoutIds = [];
}

function scheduleBossSequence(callback, delay) {
    const timeoutId = setTimeout(() => {
        bossSequenceTimeoutIds = bossSequenceTimeoutIds.filter((id) => id !== timeoutId);
        callback();
    }, delay);
    bossSequenceTimeoutIds.push(timeoutId);
}

function showBossBurst(x, y, type = "impact") {
    bossBurstElement.className = "";
    bossBurstElement.hidden = false;
    bossBurstElement.style.left = `${x}px`;
    bossBurstElement.style.top = `${y}px`;
    void bossBurstElement.offsetWidth;
    bossBurstElement.classList.add(`is-${type}`);
}

function clearBossHazards() {
    meteors.forEach(removeMeteorVisuals);
    meteors = [];
    projectiles.forEach(removeProjectileVisuals);
    projectiles = [];
    bossHazards.forEach(removeBossHazardVisuals);
    bossHazards = [];
    bossGiantAttackInProgress = false;
    bossMeteorElement.classList.remove("is-giant-charging");
    purpleEffects.forEach((effect) => {
        effect.element.remove();
        effect.warningElement.remove();
    });
    purpleEffects = [];
}

function prepareBossFinish() {
    gameOver = true;
    paused = false;
    fadeOutBgm(2000);
    bossAnnouncementElement.hidden = true;
    bossAnnouncementRemaining = 0;
    gameOverElement.hidden = true;
    bossResultElement.hidden = true;
    pauseMenuElement.hidden = true;
    menuToggleButton.hidden = true;
    clearBossHazards();
    clearExplosions();
}

function showBossResult(victory) {
    const noMissBonus = victory && !bossWasHit ?
        Math.floor(score * bossNoMissScoreMultiplier) - score : 0;
    const bonus = victory ? Math.floor(bossTimeRemaining / 1000 * bossTimeBonusPerSecond) : 0;
    bossResultTitleElement.textContent = victory ? "ボス撃破！" : "ゲームオーバー";
    bossResultScoreElement.textContent = score;
    bossResultNoMissBonusElement.textContent = noMissBonus;
    bossResultBonusElement.textContent = bonus;
    bossResultTotalElement.textContent = score + noMissBonus + bonus;
    bossResultElement.hidden = false;
}

function loadAudioBuffer(soundElement) {
    if (audioBuffers.has(soundElement.id)) return Promise.resolve(audioBuffers.get(soundElement.id));
    if (audioBufferPromises.has(soundElement.id)) return audioBufferPromises.get(soundElement.id);

    const promise = fetch(soundElement.src)
        .then((response) => {
            if (!response.ok) throw new Error(`${soundElement.id} could not be loaded`);
            return response.arrayBuffer();
        })
        .then((audioData) => bgmAudioContext.decodeAudioData(audioData))
        .then((audioBuffer) => {
            audioBuffers.set(soundElement.id, audioBuffer);
            return audioBuffer;
        });
    audioBufferPromises.set(soundElement.id, promise);
    return promise;
}

function setAudioVolume(type, volume) {
    if (type === "bgm") {
        bgmVolume = volume;
        if (bgmGainNode && bgmAudioContext) {
            bgmGainNode.gain.setTargetAtTime(volume, bgmAudioContext.currentTime, 0.015);
        }
        bgmElement.volume = volume;
        bossBgmElement.volume = volume;
    } else {
        soundEffectsVolume = volume;
        if (soundEffectsGainNode && bgmAudioContext) {
            soundEffectsGainNode.gain.setTargetAtTime(volume, bgmAudioContext.currentTime, 0.015);
        }
    }

    document.querySelectorAll(`[data-audio-volume="${type}"]`).forEach((input) => {
        input.value = Math.round(volume * 100);
        input.parentElement.querySelector("output").value = `${input.value}%`;
    });
}

function setupAudioSettings() {
    document.querySelectorAll(".audio-settings").forEach((settings) => {
        settings.addEventListener("click", (event) => event.stopPropagation());
    });
    document.querySelectorAll("[data-audio-volume]").forEach((input) => {
        const type = input.dataset.audioVolume;
        const volume = type === "bgm" ? bgmVolume : soundEffectsVolume;
        input.value = Math.round(volume * 100);
        input.parentElement.querySelector("output").value = `${input.value}%`;
        input.addEventListener("input", () => {
            setAudioVolume(type, Number(input.value) / 100);
        });
    });
    document.querySelectorAll("[data-play-comet-sample]").forEach((button) => {
        button.addEventListener("click", () => playSound(cometClashSound));
    });
}

function startBgm() {
    const selectedBgmElement = gameMode === "boss" ? bossBgmElement : bgmElement;
    if (currentBgmElement === selectedBgmElement) {
        cancelBgmFade();
        updateBgmLooping();
        if (!bgmUsingElement) {
            bgmAudioContext?.resume().catch(() => {});
        } else if (selectedBgmElement.paused) {
            selectedBgmElement.play().catch(() => {});
        }
        return;
    }

    stopBgm();
    const requestId = ++bgmRequestId;
    currentBgmElement = selectedBgmElement;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || window.location.protocol === "file:") {
        selectedBgmElement.loop = shouldLoopBgm();
        selectedBgmElement.volume = bgmVolume;
        bgmUsingElement = true;
        selectedBgmElement.play().catch(() => {});
        return;
    }

    if (!bgmAudioContext) bgmAudioContext = new AudioContextClass();
    bgmAudioContext.resume().catch(() => {});
    if (!bgmGainNode) {
        bgmGainNode = bgmAudioContext.createGain();
        bgmGainNode.gain.value = bgmVolume;
        bgmGainNode.connect(bgmAudioContext.destination);
    }
    if (!soundEffectsGainNode) {
        soundEffectsGainNode = bgmAudioContext.createGain();
        soundEffectsGainNode.gain.value = soundEffectsVolume;
        soundEffectsGainNode.connect(bgmAudioContext.destination);
    }

    [meteorClashSound, cometClashSound, meteorAbsorbedSound].forEach((sound) => {
        loadAudioBuffer(sound).catch(() => {});
    });

    loadAudioBuffer(selectedBgmElement).then((audioBuffer) => {
        if (requestId !== bgmRequestId || currentBgmElement !== selectedBgmElement || bgmSource) return;

        bgmSource = bgmAudioContext.createBufferSource();
        bgmSource.buffer = audioBuffer;
        bgmSource.loop = shouldLoopBgm();
        bgmSource.loopStart = bgmLoopStartSeconds;
        bgmSource.loopEnd = bgmLoopEndSeconds ?? audioBuffer.duration;
        bgmSource.connect(bgmGainNode);
        bgmSource.start();
        bgmUsingElement = false;
    }).catch(() => {
        if (requestId !== bgmRequestId || currentBgmElement !== selectedBgmElement) return;
        selectedBgmElement.loop = shouldLoopBgm();
        selectedBgmElement.volume = bgmVolume;
        bgmUsingElement = true;
        selectedBgmElement.play().catch(() => {});
    });
}

function shouldLoopBgm() {
    return gameMode !== "boss" || bossPauseOpenedThisRun;
}

function updateBgmLooping() {
    const shouldLoop = shouldLoopBgm();
    if (currentBgmElement) currentBgmElement.loop = shouldLoop;
    if (bgmSource) bgmSource.loop = shouldLoop;
}

function cancelBgmFade() {
    if (bgmFadeIntervalId !== null) {
        clearInterval(bgmFadeIntervalId);
        bgmFadeIntervalId = null;
    }
    bgmFadeRequestId += 1;
    if (bgmGainNode && bgmAudioContext) {
        bgmGainNode.gain.cancelScheduledValues(bgmAudioContext.currentTime);
        bgmGainNode.gain.setValueAtTime(bgmVolume, bgmAudioContext.currentTime);
    }
    if (bgmUsingElement && currentBgmElement) currentBgmElement.volume = bgmVolume;
}

function fadeOutBgm(duration) {
    cancelBgmFade();
    const fadeRequestId = bgmFadeRequestId;
    const fadingElement = currentBgmElement;
    if (!fadingElement) return;

    if (!bgmUsingElement && bgmGainNode && bgmAudioContext) {
        const now = bgmAudioContext.currentTime;
        bgmGainNode.gain.cancelScheduledValues(now);
        bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, now);
        bgmGainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
    }

    const initialVolume = fadingElement.volume;
    const startTime = performance.now();
    bgmFadeIntervalId = setInterval(() => {
        if (fadeRequestId !== bgmFadeRequestId || currentBgmElement !== fadingElement) {
            clearInterval(bgmFadeIntervalId);
            bgmFadeIntervalId = null;
            return;
        }

        const progress = Math.min((performance.now() - startTime) / duration, 1);
        if (bgmUsingElement) fadingElement.volume = initialVolume * (1 - progress);
        if (progress < 1) return;

        clearInterval(bgmFadeIntervalId);
        bgmFadeIntervalId = null;
        if (!bgmUsingElement && bgmSource) {
            bgmSource.stop();
            bgmSource.disconnect();
            bgmSource = null;
        }
        fadingElement.pause();
        fadingElement.currentTime = 0;
        fadingElement.volume = bgmVolume;
        if (bgmGainNode && bgmAudioContext) {
            bgmGainNode.gain.cancelScheduledValues(bgmAudioContext.currentTime);
            bgmGainNode.gain.setValueAtTime(bgmVolume, bgmAudioContext.currentTime);
        }
        currentBgmElement = null;
        bgmUsingElement = false;
    }, 25);
}

function stopBgm() {
    cancelBgmFade();
    bgmRequestId += 1;
    if (bgmSource) {
        bgmSource.stop();
        bgmSource.disconnect();
        bgmSource = null;
    }
    bgmUsingElement = false;
    if (currentBgmElement) {
        currentBgmElement.pause();
        currentBgmElement.currentTime = 0;
        currentBgmElement = null;
    }
}

function startGame(mode = "endless") {
    if (gameStarted) return;

    gameMode = mode;
    gameStarted = true;
    titleScreenElement.hidden = true;
    gameElement.classList.toggle("is-boss-mode", gameMode === "boss");
    gameElement.classList.toggle("is-paused", paused);
    bossHudElement.hidden = gameMode !== "boss";
    bossMeteorElement.hidden = gameMode !== "boss";
    resetGame();
    lastTime = performance.now();
    startBgm();
    scheduleUpdate();
}

function returnToTitle() {
    const previousMode = gameMode;
    gameStarted = false;
    gameMode = "endless";
    resetGame();
    menuToggleButton.hidden = true;
    gameElement.classList.remove("is-boss-mode");
    bossHudElement.hidden = true;
    bossMeteorElement.hidden = true;
    titleScreenElement.hidden = false;
    if (previousMode === "boss") startBgm();
}

function retryGame() {
    const restartBossBgm = gameMode === "boss";
    resetGame();
    if (restartBossBgm) {
        stopBgm();
        startBgm();
    } else {
        startBgm();
    }
    lastTime = performance.now();
    scheduleUpdate();
}

function setAnchor() {
    anchor.x = window.innerWidth / 2;
    anchor.y = window.innerHeight / 2;
}

function resetGame() {
    clearTimeout(gameOverTimeoutId);
    gameOverTimeoutId = null;
    clearBossSequenceTimeouts();
    setAnchor();
    ball.x = anchor.x;
    ball.y = anchor.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.dragging = false;
    ball.keyboardGrabbed = false;
    score = 0;
    gameOver = false;
    paused = false;
    gameElement.classList.remove("is-paused");
    bossPauseOpenedThisRun = false;
    bossHealth = bossMaxHealth;
    bossTimeRemaining = bossAttackDuration;
    bossMotionTime = 0;
    bossAttacksSinceGiant = 0;
    bossGiantAttackInterval = bossGiantAttackMinimumInterval +
        Math.floor(Math.random() * (bossGiantAttackMaximumInterval - bossGiantAttackMinimumInterval + 1));
    bossGiantAttackInProgress = false;
    bossWasHit = false;
    bossAnnouncementRemaining = 0;
    bossLastCountdownSecond = null;
    bossThirtySecondAlertShown = false;
    bossAnnouncementElement.hidden = true;
    bossAnnouncementElement.textContent = "";
    spawnTimer = 0;
    nextSpawn = 900;
    attackHitCount = 0;
    attackActive = false;
    clearAfterimages();
    clearScorePopups();
    clearExplosions();
    ballElement.classList.remove("is-destroying");
    ballElement.classList.remove("is-damaged");
    bossMeteorElement.classList.remove("is-damaged");
    bossMeteorElement.classList.remove("is-giant-charging");
    bossMeteorElement.classList.remove("is-timeout", "is-defeated");
    bossMeteorElement.style.left = "50%";
    bossMeteorElement.style.top = "24%";
    bossMeteorElement.style.transform = "";
    gameElement.classList.remove("is-boss-impacting");
    ballElement.classList.remove("is-boss-destroying");
    bossBurstElement.className = "";
    bossBurstElement.hidden = true;
    bossImpactSurfaceElement.className = "";
    bossImpactSurfaceElement.hidden = true;
    scoreElement.textContent = "0";
    statusElement.textContent = gameMode === "boss" ?
        "隕石をボスへ打ち返そう (ドラッグまたはSpaceキーで地球を引っ張る)" :
        "隕石を迎撃しよう (ドラッグまたはSpaceキーで地球を引っ張る)";
    gameOverElement.hidden = true;
    bossResultElement.hidden = true;
    bossHudElement.hidden = gameMode !== "boss";
    bossMeteorElement.hidden = gameMode !== "boss";
    gameElement.classList.toggle("is-boss-mode", gameMode === "boss");
    updateBossPosition();
    updateBossHud();
    pauseMenuElement.hidden = true;
    menuToggleButton.hidden = !gameStarted;
    menuToggleButton.setAttribute("aria-expanded", "false");
    menuToggleButton.setAttribute("aria-label", "メニューを開く");
    meteors.forEach(removeMeteorVisuals);
    meteors = [];
    projectiles.forEach(removeProjectileVisuals);
    projectiles = [];
    bossHazards.forEach(removeBossHazardVisuals);
    bossHazards = [];
    purpleEffects.forEach((effect) => {
        effect.element.remove();
        effect.warningElement.remove();
    });
    purpleEffects = [];
    draw();
}

function draw() {
    ballElement.style.left = `${ball.x}px`;
    ballElement.style.top = `${ball.y}px`;
    const attacking = isAttacking();
    ballElement.classList.toggle("is-attacking", attacking);
    speedMeterElement.classList.toggle("is-attacking", attacking);
    updateSpeedMeter();
}

function updateBossHud() {
    const remainingSeconds = Math.max(0, Math.ceil(bossTimeRemaining / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    const timeLabel = `${minutes}:${seconds}`;
    const healthLabel = String(Math.max(0, bossHealth));
    const healthFill = `scaleX(${Math.max(0, bossHealth / bossMaxHealth)})`;
    if (bossTimeValueElement.textContent !== timeLabel) bossTimeValueElement.textContent = timeLabel;
    if (bossHealthValueElement.textContent !== healthLabel) bossHealthValueElement.textContent = healthLabel;
    if (bossHealthFillElement.style.transform !== healthFill) bossHealthFillElement.style.transform = healthFill;
}

function getBossPosition() {
    const driftingPosition = {
        x: window.innerWidth / 2 + Math.sin(bossMotionTime * 0.00009) * window.innerWidth * 0.12,
        y: window.innerHeight * 0.24 + Math.sin(bossMotionTime * 0.00013 + 1.2) * window.innerHeight * 0.045
    };
    return driftingPosition;
}

function updateBossPosition() {
    const boss = getBossPosition();
    bossMeteorElement.style.left = `${boss.x}px`;
    bossMeteorElement.style.top = `${boss.y}px`;
}

function updateBossAttack(delta) {
    const previousTime = bossTimeRemaining;
    bossTimeRemaining = Math.max(0, bossTimeRemaining - delta);
    bossMotionTime += delta;
    updateBossPosition();
    updateBossAnnouncements(previousTime, delta);
    updateBossHud();
    if (bossTimeRemaining === 0) finishBossAttack(false);
}

function updateBossAnnouncements(previousTime, elapsed) {
    bossAnnouncementRemaining = Math.max(0, bossAnnouncementRemaining - elapsed);
    if (bossAnnouncementRemaining === 0) bossAnnouncementElement.hidden = true;

    if (!bossThirtySecondAlertShown && previousTime > 30000 && bossTimeRemaining <= 30000) {
        bossThirtySecondAlertShown = true;
        showBossAnnouncement("残り30秒！", 2000);
    }

    if (bossTimeRemaining > 0 && bossTimeRemaining <= 10000) {
        const remainingSeconds = Math.ceil(bossTimeRemaining / 1000);
        if (remainingSeconds !== bossLastCountdownSecond) {
            bossLastCountdownSecond = remainingSeconds;
            showBossAnnouncement(String(remainingSeconds), 1000, true);
        }
    }
}

function showBossAnnouncement(message, duration, countdown = false) {
    bossAnnouncementElement.classList.remove("is-countdown");
    bossAnnouncementElement.textContent = message;
    bossAnnouncementElement.hidden = false;
    if (countdown) {
        bossAnnouncementElement.classList.add("is-countdown");
        void bossAnnouncementElement.offsetWidth;
    }
    bossAnnouncementRemaining = duration;
}

function getBallSpeed() {
    return Math.hypot(ball.vx, ball.vy);
}

function isAttacking() {
    const speed = getBallSpeed();
    const distanceFromAnchor = Math.hypot(ball.x - anchor.x, ball.y - anchor.y);

    if (speed >= attackSpeed) {
        attackActive = true;
    } else if (distanceFromAnchor <= earthRadius) {
        attackActive = false;
    }

    return attackActive;
}

function setPauseMenuOpen(open) {
    if (gameOver) return;

    if (open && gameMode === "boss") {
        bossPauseOpenedThisRun = true;
        updateBgmLooping();
    }
    paused = open;
    gameElement.classList.toggle("is-paused", open);
    pauseMenuElement.hidden = !open;
    menuToggleButton.setAttribute("aria-expanded", String(open));
    menuToggleButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");

    if (open) {
        ball.dragging = false;
        ball.keyboardGrabbed = false;
    } else {
        lastTime = performance.now();
        scheduleUpdate();
    }
}

function updateSpeedMeter() {
    const speed = getBallSpeed();
    speedValueElement.textContent = speed.toFixed(1);
    speedFillElement.style.transform = `scaleX(${Math.min(speed / maxMeterSpeed, 1)})`;
}

function getSpeedScore() {
    return Math.max(10, Math.round(Math.min(getBallSpeed(), maxScoreSpeed) * 10));
}

function getAttackScore() {
    const points = Math.round(getSpeedScore() * (1 + attackHitCount * multiHitBonus));
    attackHitCount += 1;
    return points;
}

function clearScorePopups() {
    scorePopups.forEach((popup) => {
        clearTimeout(popup.timeoutId);
        popup.element.remove();
    });
    scorePopups = [];
}

function showScorePopup(x, y, points) {
    const element = document.createElement("div");
    element.className = "score-popup";
    element.textContent = `+${points}`;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    gameElement.appendChild(element);

    const popup = { element, timeoutId: null };
    popup.timeoutId = setTimeout(() => {
        element.remove();
        scorePopups = scorePopups.filter((current) => current !== popup);
    }, 700);
    scorePopups.push(popup);
}

function clearExplosions() {
    explosions.forEach((explosion) => {
        clearTimeout(explosion.timeoutId);
        explosion.element.remove();
    });
    explosions = [];
}

function showExplosion(x, y, size = "") {
    const element = document.createElement("div");
    element.className = `explosion ${size}`.trim();
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    gameElement.appendChild(element);

    const explosion = { element, timeoutId: null };
    explosion.timeoutId = setTimeout(() => {
        element.remove();
        explosions = explosions.filter((current) => current !== explosion);
    }, 500);
    explosions.push(explosion);
}

function clearAfterimages() {
    afterimages.forEach((afterimage) => afterimage.element.remove());
    afterimages = [];
    afterimageTimer = 0;
}

function updateAfterimages(delta) {
    if (isAttacking()) {
        afterimageTimer += delta;
        if (afterimageTimer >= 32) {
            afterimageTimer = 0;
            const element = document.createElement("div");
            element.className = "afterimage";
            element.style.left = `${ball.x}px`;
            element.style.top = `${ball.y}px`;
            gameElement.appendChild(element);
            afterimages.push({ element, age: 0 });
        }
    }

    afterimages = afterimages.filter((afterimage) => {
        afterimage.age += delta;
        afterimage.element.style.opacity = `${Math.max(0, 1 - afterimage.age / 260) * .55}`;
        if (afterimage.age >= 260) {
            afterimage.element.remove();
            return false;
        }
        return true;
    });
}

function physics(delta) {
    const frame = delta / 16.67;
    const dx = ball.x - anchor.x;
    const dy = ball.y - anchor.y;
    const forceX = -spring * dx - damping * ball.vx;
    const forceY = -spring * dy - damping * ball.vy;

    ball.vx += forceX * frame;
    ball.vy += forceY * frame;
    ball.x += ball.vx * frame;
    ball.y += ball.vy * frame;
}

function selectMeteorDefinition() {
    let roll = Math.random();
    for (const definition of meteorDefinitions) {
        if (score < (definition.minScore || 0)) continue;
        if (!definition.spawnChance) continue;
        if (roll < definition.spawnChance) return definition;
        roll -= definition.spawnChance;
    }
    return meteorDefinitions[meteorDefinitions.length - 1];
}

function spawnBossAttack() {
    if (bossGiantAttackInProgress) {
        const concurrentPatterns = [];
        if (bossHealth < bossMaxHealth * bossSplitUnlockHealthRatio) {
            concurrentPatterns.push(spawnBossSplitAttack);
        }
        if (bossHealth < bossMaxHealth * bossFastAttackUnlockHealthRatio) {
            concurrentPatterns.push(spawnBossFastAttack);
        }
        if (concurrentPatterns.length === 0) return;
        concurrentPatterns[Math.floor(Math.random() * concurrentPatterns.length)]();
        return;
    }

    bossAttacksSinceGiant += 1;
    if (bossAttacksSinceGiant >= bossGiantAttackInterval) {
        bossAttacksSinceGiant = 0;
        bossGiantAttackInterval = bossGiantAttackMinimumInterval +
            Math.floor(Math.random() * (bossGiantAttackMaximumInterval - bossGiantAttackMinimumInterval + 1));
        spawnBossGiantAttack();
        return;
    }

    const gravityWaveUnlocked = bossHealth < bossMaxHealth * bossGravityWaveUnlockHealthRatio;
    const gravityWaveActive = bossHazards.some((hazard) => hazard.type === "gravity-wave");
    const availablePatterns = gravityWaveUnlocked ? [] : [spawnBossNormalAttack];
    if (bossHealth < bossMaxHealth * bossSplitUnlockHealthRatio) {
        availablePatterns.push(spawnBossSplitAttack);
    }
    if (bossHealth < bossMaxHealth * bossFastAttackUnlockHealthRatio) {
        availablePatterns.push(spawnBossFastAttack);
    }
    if (gravityWaveUnlocked && !gravityWaveActive) {
        availablePatterns.push(spawnBossGravityWave);
    }
    if (availablePatterns.length === 0) return;
    const selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    selectedPattern();
}

function spawnBossGravityWave() {
    const side = Math.floor(Math.random() * 4);
    const position = Math.random();
    const spawnPoint = getSpawnPoint({ spawnMargin: -bossGravityWaveRadius }, side, position);
    const warningElement = document.createElement("div");
    warningElement.className = "black-hole-warning boss-gravity-wave-warning";
    warningElement.style.left = `${spawnPoint.x}px`;
    warningElement.style.top = `${spawnPoint.y}px`;
    warningElement.style.width = `${bossGravityWaveRadius * 2}px`;
    warningElement.style.height = `${bossGravityWaveRadius * 2}px`;
    gameElement.appendChild(warningElement);

    const element = document.createElement("div");
    element.className = "black-hole boss-gravity-wave";
    element.style.left = `${spawnPoint.x}px`;
    element.style.top = `${spawnPoint.y}px`;
    element.style.setProperty("--black-hole-size", `${bossGravityWaveRadius * 2}px`);
    element.hidden = true;
    gameElement.appendChild(element);
    bossHazards.push({
        type: "gravity-wave",
        x: spawnPoint.x,
        y: spawnPoint.y,
        side,
        position,
        radius: bossGravityWaveRadius,
        elapsed: 0,
        meteorSpawnTimer: 0,
        phase: "warning",
        warningElement,
        element
    });
}

function spawnBossGiantAttack() {
    const boss = getBossPosition();
    const backgroundElement = document.createElement("div");
    const spawnSide = Math.floor(Math.random() * 4);
    const spawnPosition = Math.random();
    const backgroundTarget = getSpawnPoint({ spawnMargin: bossGiantRadius }, spawnSide, spawnPosition);
    backgroundElement.className = "boss-giant-backdrop";
    backgroundElement.style.left = `${boss.x}px`;
    backgroundElement.style.top = `${boss.y}px`;
    gameElement.appendChild(backgroundElement);
    bossMeteorElement.classList.add("is-giant-charging");
    bossGiantAttackInProgress = true;
    bossHazards.push({
        type: "giant",
        stage: "backdrop",
        elapsed: 0,
        backgroundElement,
        backgroundX: boss.x,
        backgroundY: boss.y,
        backgroundTargetX: backgroundTarget.x,
        backgroundTargetY: backgroundTarget.y,
        spawnSide,
        spawnPosition,
        hitCount: 0,
        scoreTotal: 0,
        element: null
    });
}

function launchBossGiantMeteor(hazard) {
    hazard.stage = "approach";
    hazard.elapsed = 0;
    hazard.element = document.createElement("div");
    hazard.element.className = "boss-giant-hazard";
    hazard.element.dataset.hits = String(3 - hazard.hitCount);
    hazard.targetX = ball.x;
    hazard.targetY = ball.y;
    const spawnPoint = getSpawnPoint(
        { spawnMargin: bossGiantRadius + 20 },
        hazard.spawnSide,
        hazard.spawnPosition
    );
    hazard.x = spawnPoint.x;
    hazard.y = spawnPoint.y;
    hazard.hasEnteredScreen = false;
    const directionX = hazard.targetX - hazard.x;
    const directionY = hazard.targetY - hazard.y;
    const distance = Math.hypot(directionX, directionY) || 1;
    hazard.vx = directionX / distance * bossGiantApproachSpeed;
    hazard.vy = directionY / distance * bossGiantApproachSpeed;
    hazard.element.style.left = `${hazard.x}px`;
    hazard.element.style.top = `${hazard.y}px`;
    gameElement.appendChild(hazard.element);
}

function spawnBossNormalAttack() {
    const normalMeteor = meteorDefinitions[meteorDefinitions.length - 1];
    for (let index = 0; index < 3; index += 1) {
        const spawnPoint = getSpawnPoint(normalMeteor);
        createMeteor(normalMeteor, spawnPoint.x, spawnPoint.y);
    }
}

function spawnBossFastAttack() {
    const orangeMeteor = meteorDefinitions.find((definition) => definition.id === "orange");
    if (!orangeMeteor) throw new Error("Orange meteor definition is required for the boss fast attack");

    const fastMeteor = { ...orangeMeteor, scoreMultiplier: 4 };
    const count = bossHealth < bossMaxHealth * bossFastAttackDoubleCountHealthRatio ? 2 : 1;
    for (let index = 0; index < count; index += 1) {
        const spawnPoint = getSpawnPoint(fastMeteor);
        createMeteor(fastMeteor, spawnPoint.x, spawnPoint.y, { x: ball.x, y: ball.y });
    }
}

function spawnBossSplitAttack() {
    const targetInsetX = window.innerWidth * bossSplitTargetInsetRatio;
    const targetInsetY = window.innerHeight * bossSplitTargetInsetRatio;
    const target = {
        x: targetInsetX + Math.random() * (window.innerWidth - targetInsetX * 2),
        y: targetInsetY + Math.random() * (window.innerHeight - targetInsetY * 2)
    };
    const warningElement = document.createElement("div");
    warningElement.className = "boss-split-warning";
    warningElement.style.left = `${target.x}px`;
    warningElement.style.top = `${target.y}px`;
    gameElement.appendChild(warningElement);

    const element = document.createElement("div");
    element.className = "boss-split-giant";
    element.style.left = `${target.x}px`;
    element.style.top = `${target.y}px`;
    gameElement.appendChild(element);
    bossHazards.push({
        type: "split-giant",
        x: target.x,
        y: target.y,
        elapsed: 0,
        fragmentCount: bossHealth < bossMaxHealth * bossSplitFiveFragmentHealthRatio ? 5 : 3,
        warningElement,
        element
    });
}

function spawnBossSplitFragments(x, y, count) {
    const initialAngle = Math.random() * Math.PI * 2;
    const fragments = [];
    for (let index = 0; index < count; index += 1) {
        const angle = initialAngle + index * Math.PI * 2 / count;
        const element = document.createElement("div");
        element.className = "meteor boss-split-fragment";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        gameElement.appendChild(element);
        fragments.push({
            type: "split-fragment",
            originX: x,
            originY: y,
            x,
            y,
            angle,
            elapsed: 0,
            element
        });
    }
    return fragments;
}

function removeBossHazardVisuals(hazard) {
    hazard.warningElement?.remove();
    hazard.backgroundElement?.remove();
    hazard.element?.remove();
}

function applyBossHazardHit(penalty, x, y) {
    bossWasHit = true;
    const previousTime = bossTimeRemaining;
    bossTimeRemaining = Math.max(0, bossTimeRemaining - penalty);
    updateBossAnnouncements(previousTime, 0);
    updateBossHud();
    statusElement.textContent = `被弾！ 残り時間 -${penalty / 1000} 秒`;
    animateEarthDamage();
    showDamagePopup(x, y - earthRadius, penalty);
    if (bossTimeRemaining === 0) finishBossAttack(false);
}

function updateBossHazards(delta) {
    const frame = delta / 16.67;
    const remainingHazards = [];

    for (const hazard of bossHazards) {
        hazard.elapsed += delta;

        if (hazard.type === "giant") {
            if (updateBossGiantHazard(hazard, delta, frame, remainingHazards)) return;
            continue;
        }

        if (hazard.type === "gravity-wave") {
            if (updateBossGravityWave(hazard, delta, remainingHazards)) return;
            continue;
        }

        if (hazard.type === "split-giant") {
            const approachProgress = Math.max(0, Math.min(
                (hazard.elapsed - bossSplitWarningDuration) / bossSplitApproachDuration,
                1
            ));
            const scale = 0.12 + approachProgress * 0.88;
            hazard.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
            hazard.element.style.opacity = String(0.25 + approachProgress * 0.75);

            if (hazard.elapsed < bossSplitWarningDuration + bossSplitApproachDuration) {
                remainingHazards.push(hazard);
                continue;
            }

            removeBossHazardVisuals(hazard);
            const distance = Math.hypot(ball.x - hazard.x, ball.y - hazard.y);
            if (distance <= earthRadius * 2) {
                applyBossHazardHit(bossSplitGiantTimePenalty, hazard.x, hazard.y);
                if (gameOver) return;
            }
            showExplosion(hazard.x, hazard.y, "explosion-large");
            remainingHazards.push(...spawnBossSplitFragments(hazard.x, hazard.y, hazard.fragmentCount));
            continue;
        }

        hazard.angle += 0.045 * frame;
        const radius = hazard.elapsed / 16.67 * 2.8;
        hazard.x = hazard.originX + Math.cos(hazard.angle) * radius;
        hazard.y = hazard.originY + Math.sin(hazard.angle) * radius;
        hazard.element.style.left = `${hazard.x}px`;
        hazard.element.style.top = `${hazard.y}px`;
        hazard.element.style.transform = `translate(-50%, -50%) rotate(${hazard.elapsed * 0.012}rad)`;

        if (hazard.elapsed >= bossSplitFragmentCollisionDelay) {
            const distance = Math.hypot(hazard.x - ball.x, hazard.y - ball.y);
            if (distance <= earthRadius + 10) {
                if (isAttacking()) {
                    const damage = getScoreForMultiplier(2);
                    attackHitCount += 1;
                    playSound(meteorClashSound);
                    launchBossProjectile(
                        hazard.x,
                        hazard.y,
                        damage,
                        "boss-attack-projectile meteor boss-split-fragment"
                    );
                } else {
                    applyBossHazardHit(bossSplitFragmentTimePenalty, hazard.x, hazard.y);
                    if (gameOver) return;
                }
                removeBossHazardVisuals(hazard);
                continue;
            }
        }

        if (hazard.x < -40 || hazard.x > window.innerWidth + 40 ||
            hazard.y < -40 || hazard.y > window.innerHeight + 40) {
            removeBossHazardVisuals(hazard);
            continue;
        }
        remainingHazards.push(hazard);
    }

    bossHazards = remainingHazards;
}

function updateBossGravityWave(hazard, delta, remainingHazards) {
    if (hazard.phase === "warning") {
        if (hazard.elapsed >= bossGravityWaveWarningDuration) {
            hazard.warningElement.remove();
            hazard.warningElement = null;
            hazard.element.hidden = false;
            hazard.phase = "active";
            hazard.elapsed = 0;
        }
        remainingHazards.push(hazard);
        return false;
    }

    if (hazard.phase === "closing") {
        if (hazard.elapsed >= 200) {
            removeBossHazardVisuals(hazard);
            return false;
        }
        remainingHazards.push(hazard);
        return false;
    }

    if (hazard.elapsed >= bossGravityWaveDuration) {
        hazard.phase = "closing";
        hazard.elapsed = 0;
        hazard.element.classList.add("is-closing");
        remainingHazards.push(hazard);
        return false;
    }

    hazard.meteorSpawnTimer += delta;
    if (hazard.meteorSpawnTimer >= bossGravityWaveMeteorInterval) {
        hazard.meteorSpawnTimer -= bossGravityWaveMeteorInterval;
        const normalMeteor = meteorDefinitions[meteorDefinitions.length - 1];
        const oppositeSide = hazard.side ^ 1;
        const spawnPosition = Math.max(
            0.1,
            Math.min(0.9, hazard.position + (Math.random() - 0.5) * bossGravityWaveSpawnJitter)
        );
        const spawnPoint = getSpawnPoint(normalMeteor, oppositeSide, spawnPosition);
        createMeteor(normalMeteor, spawnPoint.x, spawnPoint.y, { x: hazard.x, y: hazard.y });
    }

    const distanceToEarth = Math.hypot(hazard.x - ball.x, hazard.y - ball.y);
    if (!ball.dragging && !ball.keyboardGrabbed && !isAttacking() &&
        distanceToEarth <= bossGravityWaveInfluenceRadius) {
        const directionX = hazard.x - ball.x;
        const directionY = hazard.y - ball.y;
        const distance = Math.max(distanceToEarth, 1);
        const pull = 0.045 * Math.max(0, 1 - distanceToEarth / bossGravityWaveInfluenceRadius);
        ball.vx += directionX / distance * pull;
        ball.vy += directionY / distance * pull;
    }

    if (distanceToEarth <= hazard.radius + earthRadius) {
        removeBossHazardVisuals(hazard);
        applyBossHazardHit(bossGravityWaveTimePenalty, ball.x, ball.y);
        return gameOver;
    }

    remainingHazards.push(hazard);
    return false;
}

function updateBossGiantHazard(hazard, delta, frame, remainingHazards) {
    if (hazard.stage === "backdrop") {
        const progress = Math.min(hazard.elapsed / bossGiantBackdropDuration, 1);
        const easedProgress = progress * progress;
        hazard.backgroundElement.style.left =
            `${hazard.backgroundX + (hazard.backgroundTargetX - hazard.backgroundX) * easedProgress}px`;
        hazard.backgroundElement.style.top =
            `${hazard.backgroundY + (hazard.backgroundTargetY - hazard.backgroundY) * easedProgress}px`;
        const scale = 0.5 - progress * 0.4;
        hazard.backgroundElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
        hazard.backgroundElement.style.opacity = String(1 - progress);
        if (progress < 1) {
            remainingHazards.push(hazard);
            return false;
        }

        hazard.backgroundElement.remove();
        hazard.backgroundElement = null;
        bossMeteorElement.classList.remove("is-giant-charging");
        launchBossGiantMeteor(hazard);
        remainingHazards.push(hazard);
        return false;
    }

    if (hazard.stage === "knocked-away" || hazard.stage === "returning" ||
        hazard.stage === "passing-through") {
        if (hazard.stage !== "knocked-away" && despawnBossGiantIfOutOfBounds(hazard)) return false;
        const targetX = hazard.stage === "knocked-away" ? hazard.edgeX :
            hazard.stage === "returning" ? hazard.returnX : hazard.exitX;
        const targetY = hazard.stage === "knocked-away" ? hazard.edgeY :
            hazard.stage === "returning" ? hazard.returnY : hazard.exitY;
        const speed = hazard.stage === "knocked-away" ?
            bossGiantKnockbackSpeed * hazard.hitCount :
            bossGiantReturnSpeed * hazard.hitCount * bossGiantReturnSpeedMultiplier;
        const directionX = targetX - hazard.x;
        const directionY = targetY - hazard.y;
        const distance = Math.hypot(directionX, directionY);
        let reachedReturnTarget = false;
        if (distance <= speed * frame) {
            hazard.x = targetX;
            hazard.y = targetY;
            if (hazard.stage === "knocked-away") {
                hazard.stage = "returning";
                hazard.elapsed = 0;
                hazard.hasEnteredScreen = false;
                hazard.element.classList.remove("is-knocked-away");
            } else if (hazard.stage === "returning") {
                hazard.stage = "passing-through";
                const direction = distance > 0 ?
                    { x: directionX / distance, y: directionY / distance } :
                    { x: hazard.vx, y: hazard.vy };
                const exitPoint = getBossGiantExitPoint(hazard.x, hazard.y, direction.x, direction.y);
                hazard.exitX = exitPoint.x;
                hazard.exitY = exitPoint.y;
            } else {
                reachedReturnTarget = true;
            }
        } else if (distance > 0) {
            hazard.x += directionX / distance * speed * frame;
            hazard.y += directionY / distance * speed * frame;
        }
        hazard.element.style.left = `${hazard.x}px`;
        hazard.element.style.top = `${hazard.y}px`;
        if (hazard.stage !== "knocked-away" && despawnBossGiantIfOutOfBounds(hazard)) return false;
        if (hazard.stage !== "knocked-away" &&
            Math.hypot(hazard.x - ball.x, hazard.y - ball.y) <= bossGiantRadius + earthRadius) {
            return handleBossGiantCollision(hazard, remainingHazards);
        }
        if (reachedReturnTarget) {
            removeBossHazardVisuals(hazard);
            bossGiantAttackInProgress = false;
            return false;
        }
        remainingHazards.push(hazard);
        return false;
    }

    if (despawnBossGiantIfOutOfBounds(hazard)) return false;
    hazard.x += hazard.vx * frame;
    hazard.y += hazard.vy * frame;
    hazard.element.style.left = `${hazard.x}px`;
    hazard.element.style.top = `${hazard.y}px`;
    if (despawnBossGiantIfOutOfBounds(hazard)) return false;
    const distanceToEarth = Math.hypot(hazard.x - ball.x, hazard.y - ball.y);
    if (distanceToEarth <= bossGiantRadius + earthRadius) {
        return handleBossGiantCollision(hazard, remainingHazards);
    }

    remainingHazards.push(hazard);
    return false;
}

function despawnBossGiantIfOutOfBounds(hazard) {
    const isOnScreen = hazard.x >= 0 && hazard.x <= window.innerWidth &&
        hazard.y >= 0 && hazard.y <= window.innerHeight;
    if (isOnScreen) hazard.hasEnteredScreen = true;
    const isOutsideScreen = hazard.x < -bossGiantRadius ||
        hazard.x > window.innerWidth + bossGiantRadius ||
        hazard.y < -bossGiantRadius ||
        hazard.y > window.innerHeight + bossGiantRadius;
    if (!hazard.hasEnteredScreen || !isOutsideScreen) return false;

    removeBossHazardVisuals(hazard);
    bossGiantAttackInProgress = false;
    return true;
}

function handleBossGiantCollision(hazard, remainingHazards) {
    if (!isAttacking()) {
        removeBossHazardVisuals(hazard);
        bossGiantAttackInProgress = false;
        applyBossHazardHit(bossGiantTimePenalty, ball.x, ball.y);
        return gameOver;
    }

    const hitScore = getScoreForMultiplier(1);
    attackHitCount += 1;
    hazard.scoreTotal += hitScore;
    hazard.hitCount += 1;
    showExplosion(hazard.x, hazard.y, "explosion-large");
    if (hazard.hitCount >= 3) {
        playSound(cometClashSound);
        const damage = hazard.scoreTotal * 5;
        launchBossProjectile(
            hazard.x,
            hazard.y,
            damage,
            "boss-attack-projectile boss-giant-return-projectile"
        );
        projectiles[projectiles.length - 1].isGiantBossAttack = true;
        removeBossHazardVisuals(hazard);
        statusElement.textContent = `巨大隕石を撃破！ ${damage} ダメージ`;
        return false;
    }

    playSound(meteorClashSound);
    hazard.element.dataset.hits = String(3 - hazard.hitCount);
    showBossBurst(hazard.x, hazard.y);
    launchBossGiantAway(hazard);
    remainingHazards.push(hazard);
    return false;
}

function launchBossGiantAway(hazard) {
    let directionX = hazard.x - ball.x;
    let directionY = hazard.y - ball.y;
    if (Math.hypot(directionX, directionY) < 1) {
        directionX = hazard.vx ? -hazard.vx : (ball.x < window.innerWidth / 2 ? 1 : -1);
        directionY = hazard.vy ? -hazard.vy : 0;
    }
    const edgePoint = getBossGiantExitPoint(hazard.x, hazard.y, directionX, directionY);

    hazard.stage = "knocked-away";
    hazard.edgeX = edgePoint.x;
    hazard.edgeY = edgePoint.y;
    hazard.returnX = ball.x;
    hazard.returnY = ball.y;
    hazard.element.classList.add("is-knocked-away");
}

function getBossGiantExitPoint(x, y, directionX, directionY) {
    const distance = Math.hypot(directionX, directionY);
    if (distance === 0) return { x, y };

    const velocityX = directionX / distance;
    const velocityY = directionY / distance;
    const edgeDistance = Math.min(
        velocityX > 0 ? (window.innerWidth + bossGiantRadius - x) / velocityX :
            velocityX < 0 ? (-bossGiantRadius - x) / velocityX : Infinity,
        velocityY > 0 ? (window.innerHeight + bossGiantRadius - y) / velocityY :
            velocityY < 0 ? (-bossGiantRadius - y) / velocityY : Infinity
    );
    return {
        x: x + velocityX * edgeDistance,
        y: y + velocityY * edgeDistance
    };
}

function getSpawnPoint(definition, side = Math.floor(Math.random() * 4), edgePosition = Math.random()) {
    const margin = definition.spawnMargin || 42;
    let x;
    let y;

    if (side === 0) {
        x = -margin;
        y = edgePosition * window.innerHeight;
    } else if (side === 1) {
        x = window.innerWidth + margin;
        y = edgePosition * window.innerHeight;
    } else if (side === 2) {
        x = edgePosition * window.innerWidth;
        y = -margin;
    } else {
        x = edgePosition * window.innerWidth;
        y = window.innerHeight + margin;
    }

    return { x, y };
}

function createWarningTrajectory(x, y, targetX, targetY) {
    const element = document.createElement("div");
    const distance = Math.hypot(targetX - x, targetY - y);
    const angle = Math.atan2(targetY - y, targetX - x) * 180 / Math.PI;

    element.className = "warning-trajectory";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.width = `${distance}px`;
    element.style.transform = `rotate(${angle}deg)`;
    gameElement.appendChild(element);
    return element;
}

function createMeteor(definition, x, y, target = anchor) {
    const targetX = target.x;
    const targetY = target.y;
    const directionX = targetX - x;
    const directionY = targetY - y;
    const distance = Math.hypot(directionX, directionY);
    const direction = { x: directionX / distance, y: directionY / distance };
    const element = document.createElement("div");
    const warningElement = definition.warning ?
        createWarningTrajectory(x, y, targetX, targetY) : null;

    element.className = `meteor meteor-${definition.id}`;
    element.style.visibility = definition.warning ? "hidden" : "visible";
    gameElement.appendChild(element);
    meteors.push({
        definition,
        x,
        y,
        vx: direction.x * (definition.speed || 1),
        vy: direction.y * (definition.speed || 1),
        radialDistance: distance,
        orbitAngle: Math.atan2(y - anchor.y, x - anchor.x),
        orbitDirection: Math.random() < .5 ? -1 : 1,
        targetX,
        targetY,
        cycleTimer: 0,
        shotTimer: definition.projectileSpeed ? 2000 + Math.random() * 2000 : 0,
        launchTimer: 0,
        launched: !definition.launchDelay,
        warningElement,
        element
    });
}

function spawnMeteor() {
    if (gameMode === "boss") {
        spawnBossAttack();
        return;
    }

    const definition = selectMeteorDefinition();
    const spawnPoint = getSpawnPoint(definition);
    let target = {
        x: anchor.x,
        y: anchor.y
    };

    if (definition.movement === "targeted") {
        target = {
            x: ball.x,
            y: ball.y
        };
    } else if (definition.movement === "off-center") {
        const directionX = anchor.x - spawnPoint.x;
        const directionY = anchor.y - spawnPoint.y;
        const distance = Math.hypot(directionX, directionY);
        const perpendicular = { x: -directionY / distance, y: directionX / distance };
        const offset = 150 + Math.random() * 100;
        target = {
            x: anchor.x + perpendicular.x * offset,
            y: anchor.y + perpendicular.y * offset
        };
    }

    createMeteor(definition, spawnPoint.x, spawnPoint.y, target);
}

function updateMeteorPosition(meteor, frame, delta, gravityWave) {
    if (!meteor.launched) {
        meteor.launchTimer += delta;
        if (meteor.launchTimer < meteor.definition.launchDelay) return;
        meteor.launched = true;
        meteor.warningElement?.remove();
        meteor.warningElement = null;
        meteor.element.style.visibility = "visible";
    }

    if (meteor.definition.movement === "spiral") {
        meteor.radialDistance = Math.max(0, meteor.radialDistance - meteor.definition.approachSpeed * frame);
        meteor.orbitAngle += meteor.orbitDirection * meteor.definition.orbitSpeed * frame;
        meteor.x = anchor.x + Math.cos(meteor.orbitAngle) * meteor.radialDistance;
        meteor.y = anchor.y + Math.sin(meteor.orbitAngle) * meteor.radialDistance;
    } else if (meteor.definition.movement === "tracking-cycle") {
        meteor.cycleTimer = (meteor.cycleTimer + delta) % 3000;
        if (meteor.cycleTimer < 1500) {
            const directionX = ball.x - meteor.x;
            const directionY = ball.y - meteor.y;
            const distance = Math.hypot(directionX, directionY);
            const step = meteor.definition.speed * frame;
            if (distance > 0) {
                meteor.x += directionX / distance * Math.min(step, distance);
                meteor.y += directionY / distance * Math.min(step, distance);
            }
        }
    } else if (gameMode === "boss" && meteor.definition.id === "normal") {
        if (gravityWave) {
            const directionX = gravityWave.x - meteor.x;
            const directionY = gravityWave.y - meteor.y;
            const distance = Math.hypot(directionX, directionY);
            const step = (meteor.definition.speed || 1) * 1.4 * frame;
            if (distance > 0) {
                meteor.x += directionX / distance * Math.min(step, distance);
                meteor.y += directionY / distance * Math.min(step, distance);
            }
        } else {
            meteor.x += meteor.vx * frame;
            meteor.y += meteor.vy * frame;
        }
    } else {
        meteor.x += meteor.vx * frame;
        meteor.y += meteor.vy * frame;
    }
    meteor.element.style.left = `${meteor.x}px`;
    meteor.element.style.top = `${meteor.y}px`;
}

function removeMeteorVisuals(meteor) {
    meteor.element.remove();
    meteor.warningElement?.remove();
}

function createProjectile(x, y, targetX, targetY, speed, sourceMeteor) {
    const directionX = targetX - x;
    const directionY = targetY - y;
    const distance = Math.hypot(directionX, directionY);
    if (distance === 0) return;

    const element = document.createElement("div");
    element.className = "red-projectile";
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    gameElement.appendChild(element);
    projectiles.push({
        x,
        y,
        vx: directionX / distance * speed,
        vy: directionY / distance * speed,
        sourceMeteor,
        element
    });
}

function removeProjectileVisuals(projectile) {
    projectile.element.remove();
}

function startPurpleAftermath(meteor) {
    const sizeMultiplier = meteor.definition.sizeMultiplier || 1;
    const blackHoleRadius = meteorRadius * sizeMultiplier * 2 * 3;
    const warningElement = document.createElement("div");
    const warningRadius = blackHoleRadius + earthRadius;
    meteor.element.classList.add("is-shaking");
    warningElement.className = "black-hole-warning";
    warningElement.style.left = `${meteor.x}px`;
    warningElement.style.top = `${meteor.y}px`;
    warningElement.style.width = `${warningRadius * 2}px`;
    warningElement.style.height = `${warningRadius * 2}px`;
    gameElement.appendChild(warningElement);
    purpleEffects.push({
        x: meteor.x,
        y: meteor.y,
        radius: blackHoleRadius,
        phase: "charging",
        elapsed: 0,
        warningElement,
        element: meteor.element
    });
}

function updateMeteorFire(meteor, delta) {
    if (!meteor.definition.projectileSpeed) return;

    meteor.shotTimer -= delta;
    if (meteor.shotTimer > 0) return;

    createProjectile(meteor.x, meteor.y, ball.x, ball.y, meteor.definition.projectileSpeed, meteor);
    meteor.shotTimer = 2000 + Math.random() * 2000;
}

function getMeteorScore(meteor) {
    const points = getScoreForMultiplier(meteor.definition.scoreMultiplier);
    attackHitCount += 1;
    return points;
}

function getScoreForMultiplier(multiplier) {
    const baseScore = getSpeedScore() * multiplier;
    return Math.round(baseScore * (1 + attackHitCount * multiHitBonus));
}

function getProjectileScore() {
    const points = getScoreForMultiplier(1);
    attackHitCount += 1;
    return points;
}

function launchMeteorAtBoss(meteor, points) {
    playSound(meteorClashSound);
    launchBossProjectile(
        meteor.x,
        meteor.y,
        points,
        `boss-attack-projectile meteor meteor-${meteor.definition.id}`
    );
    removeMeteorVisuals(meteor);
    showExplosion(meteor.x, meteor.y);
}

function launchBossProjectile(x, y, damage, className) {
    const element = document.createElement("div");
    element.className = className;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    gameElement.appendChild(element);
    const boss = getBossPosition();
    const directionX = boss.x - x;
    const directionY = boss.y - y;
    const distance = Math.hypot(directionX, directionY) || 1;
    const speed = Math.max(8, getBallSpeed() * 1.5);
    projectiles.push({
        x,
        y,
        initialDistance: distance,
        vx: directionX / distance * speed,
        vy: directionY / distance * speed,
        damage,
        isBossAttack: true,
        element
    });
}

function destroyMeteor(meteor, playImpactSound = true) {
    if (playImpactSound) {
        playSound(meteor.definition.id === "comet" ? cometClashSound : meteorClashSound);
    }
    const points = getMeteorScore(meteor);
    score += points;
    scoreElement.textContent = score;
    showScorePopup(meteor.x, meteor.y, points);
    if (meteor.definition.id !== "purple") showExplosion(meteor.x, meteor.y);
    if (meteor.definition.id === "purple") {
        startPurpleAftermath(meteor);
    } else {
        removeMeteorVisuals(meteor);
    }
}

function destroyMeteorByBlackHole(meteor) {
    playSound(meteorAbsorbedSound);
    const points = meteor.definition.scoreMultiplier * 500;
    score += points;
    scoreElement.textContent = score;
    showScorePopup(meteor.x, meteor.y, points);
    if (meteor.definition.id !== "purple") showExplosion(meteor.x, meteor.y);
    removeMeteorVisuals(meteor);
}

function updateMeteors(delta) {
    const frame = delta / 16.67;
    if (gameMode === "boss") updateBossHazards(delta);
    if (gameOver) return;
    if (!isAttacking()) attackHitCount = 0;
    spawnTimer += delta;
    if (spawnTimer >= nextSpawn) {
        spawnTimer = 0;
        nextSpawn = gameMode === "boss" ? 1900 + Math.random() * 1100 : 700 + Math.random() * 700;
        spawnMeteor();
    }

    const remainingMeteors = [];
    const destroyedMeteors = new Set();
    const gravityWave = gameMode === "boss" ? bossHazards.find((hazard) =>
        hazard.type === "gravity-wave" && hazard.phase === "active"
    ) : null;

    meteors.forEach((meteor) => {
        if (gameOver) {
            removeMeteorVisuals(meteor);
            return;
        }
        if (destroyedMeteors.has(meteor)) return;
        updateMeteorPosition(meteor, frame, delta, gravityWave);
        if (!meteor.launched) {
            remainingMeteors.push(meteor);
            return;
        }
        updateMeteorFire(meteor, delta);

        const distance = Math.hypot(meteor.x - ball.x, meteor.y - ball.y);
        if (meteor.definition.movement === "spiral" && meteor.radialDistance <= 0) {
            removeMeteorVisuals(meteor);
            return;
        }
        const currentMeteorRadius = meteorRadius * (meteor.definition.sizeMultiplier || 1);
        if (distance <= earthRadius + currentMeteorRadius) {
            if (isAttacking()) {
                if (gameMode === "boss") {
                    const points = getMeteorScore(meteor);
                    launchMeteorAtBoss(meteor, points);
                    destroyedMeteors.add(meteor);
                    statusElement.textContent = `ボスへ反撃！ ${points} ダメージ`;
                    return;
                }
                destroyMeteor(meteor);
                destroyedMeteors.add(meteor);
                if (meteor.definition.clearsScreen) {
                    meteors.forEach((otherMeteor) => {
                        if (otherMeteor === meteor || destroyedMeteors.has(otherMeteor)) return;
                        destroyMeteor(otherMeteor, false);
                        destroyedMeteors.add(otherMeteor);
                    });
                }
                statusElement.textContent = "迎撃成功！ まとめて破壊したり、ハイスピードで撃墜すると高得点";
                return;
            }
            removeMeteorVisuals(meteor);
            if (gameMode === "boss") {
                applyBossHazardHit(bossTimePenalty, ball.x, ball.y);
                return;
            }
            endGame();
            return;
        }

        if (gameMode === "boss" && meteor.definition.id === "normal" &&
            isMeteorAbsorbedByBossGravityWave(meteor, gravityWave)) {
            removeMeteorVisuals(meteor);
            return;
        }

        const despawnMargin = meteor.definition.despawnMargin || 80;
        if (meteor.x < -despawnMargin || meteor.x > window.innerWidth + despawnMargin ||
            meteor.y < -despawnMargin || meteor.y > window.innerHeight + despawnMargin) {
            removeMeteorVisuals(meteor);
            return;
        }
        remainingMeteors.push(meteor);
    });

    meteors = remainingMeteors.filter((meteor) => !destroyedMeteors.has(meteor));
}

function isMeteorAbsorbedByBossGravityWave(meteor, gravityWave) {
    return meteor.definition.id === "normal" && gravityWave &&
        Math.hypot(gravityWave.x - meteor.x, gravityWave.y - meteor.y) <=
        gravityWave.radius + meteorRadius;
}

function applyBlackHoleCollisions(effect, blackHoleRadius) {
    const distanceToEarth = Math.hypot(effect.x - ball.x, effect.y - ball.y);
    if (distanceToEarth <= blackHoleRadius + earthRadius) {
        endGame();
        return false;
    }

    const remainingMeteors = [];
    meteors.forEach((meteor) => {
        const distance = Math.hypot(effect.x - meteor.x, effect.y - meteor.y);
        const currentMeteorRadius = meteorRadius * (meteor.definition.sizeMultiplier || 1);
        if (distance <= blackHoleRadius + currentMeteorRadius) {
            destroyMeteorByBlackHole(meteor);
        } else {
            remainingMeteors.push(meteor);
        }
    });
    meteors = remainingMeteors;
    return true;
}

function updatePurpleEffects(delta) {
    const remainingEffects = [];

    for (const effect of purpleEffects) {
        effect.elapsed += delta;

        if (effect.phase === "closing") {
            if (effect.elapsed >= 200) {
                effect.element.remove();
                continue;
            }
            remainingEffects.push(effect);
            continue;
        }

        if (effect.phase === "charging") {
            if (effect.elapsed < 2000) {
                remainingEffects.push(effect);
                continue;
            }
            effect.elapsed = 0;
            effect.phase = "appearing";
            effect.element.className = "black-hole";
            effect.element.style.setProperty("--black-hole-size", `${effect.radius * 2}px`);
            remainingEffects.push(effect);
            continue;
        }

        if (effect.phase === "appearing") {
            const growth = Math.min(effect.elapsed / 200, 1);
            if (!applyBlackHoleCollisions(effect, effect.radius * growth)) return;

            if (effect.elapsed >= 200) {
                effect.elapsed -= 200;
                effect.phase = "black-hole";
                effect.warningElement.remove();
                remainingEffects.push(effect);
                continue;
            } else {
                remainingEffects.push(effect);
                continue;
            }
        }

        if (effect.elapsed >= 5000) {
            effect.phase = "closing";
            effect.elapsed = 0;
            effect.element.classList.add("is-closing");
            remainingEffects.push(effect);
            continue;
        }

        if (!applyBlackHoleCollisions(effect, effect.radius)) return;
        remainingEffects.push(effect);
    }

    purpleEffects = remainingEffects;
}

function updateProjectiles(delta) {
    const frame = delta / 16.67;
    const remainingProjectiles = [];
    const activeMeteors = new Set(meteors);

    for (const projectile of projectiles) {
        if (projectile.isBossAttack) {
            const boss = getBossPosition();
            const targetX = boss.x - projectile.x;
            const targetY = boss.y - projectile.y;
            const targetDistance = Math.hypot(targetX, targetY) || 1;
            const projectileSpeed = Math.hypot(projectile.vx, projectile.vy);
            const steering = Math.min(1, 0.1 * frame);
            projectile.vx += (targetX / targetDistance * projectileSpeed - projectile.vx) * steering;
            projectile.vy += (targetY / targetDistance * projectileSpeed - projectile.vy) * steering;
            projectile.x += projectile.vx * frame;
            projectile.y += projectile.vy * frame;
            projectile.element.style.left = `${projectile.x}px`;
            projectile.element.style.top = `${projectile.y}px`;

            const distanceToBoss = Math.hypot(boss.x - projectile.x, boss.y - projectile.y);
            const depth = Math.min(1, 1 - distanceToBoss / projectile.initialDistance);
            projectile.element.style.setProperty("--depth-scale", String(1 - depth * 0.78));
            projectile.element.style.setProperty("--depth-opacity", String(1 - depth * 0.76));
            projectile.element.style.setProperty("--depth-brightness", String(1 - depth * 0.68));
            const bossCoreRadius = Math.max(36, Math.min(window.innerWidth, window.innerHeight) * 0.06);
            const passedBoss = (boss.x - projectile.x) * projectile.vx +
                (boss.y - projectile.y) * projectile.vy <= 0;
            if (distanceToBoss <= bossCoreRadius || passedBoss) {
                score += projectile.damage;
                scoreElement.textContent = score;
                showScorePopup(projectile.x, projectile.y, projectile.damage);
                bossHealth = Math.max(0, bossHealth - projectile.damage);
                updateBossHud();
                animateBossDamage();
                showBossBurst(projectile.x, projectile.y);
                removeProjectileVisuals(projectile);
                if (projectile.isGiantBossAttack) bossGiantAttackInProgress = false;
                if (bossHealth === 0) {
                    finishBossAttack(true);
                    projectiles.forEach(removeProjectileVisuals);
                    projectiles = [];
                    return;
                }
                continue;
            }
            remainingProjectiles.push(projectile);
            continue;
        }

        if (!activeMeteors.has(projectile.sourceMeteor)) {
            removeProjectileVisuals(projectile);
            continue;
        }

        projectile.x += projectile.vx * frame;
        projectile.y += projectile.vy * frame;
        projectile.element.style.left = `${projectile.x}px`;
        projectile.element.style.top = `${projectile.y}px`;

        const distance = Math.hypot(projectile.x - ball.x, projectile.y - ball.y);
        if (distance <= earthRadius + projectileRadius) {
            if (isAttacking()) {
                const points = getProjectileScore();
                score += points;
                scoreElement.textContent = score;
                showScorePopup(projectile.x, projectile.y, points);
                removeProjectileVisuals(projectile);
                continue;
            }
            removeProjectileVisuals(projectile);
            endGame();
            projectiles.forEach(removeProjectileVisuals);
            projectiles = [];
            return;
        }

        if (projectile.x < -40 || projectile.x > window.innerWidth + 40 ||
            projectile.y < -40 || projectile.y > window.innerHeight + 40) {
            removeProjectileVisuals(projectile);
            continue;
        }
        remainingProjectiles.push(projectile);
    }

    projectiles = remainingProjectiles;
}

function endGame() {
    if (gameOver) return;
    if (gameMode === "boss") {
        finishBossAttack(false);
        return;
    }

    gameOver = true;
    paused = false;
    pauseMenuElement.hidden = true;
    menuToggleButton.hidden = true;
    meteors.forEach((meteor) => meteor.warningElement?.remove());
    finalScoreElement.textContent = score;
    ballElement.classList.add("is-destroying");
    showExplosion(ball.x, ball.y, "explosion-large");
    statusElement.textContent = "地球に隕石が衝突しました";
    gameOverTimeoutId = setTimeout(() => {
        gameOverElement.hidden = false;
    }, 300);
}

function finishBossAttack(victory) {
    if (gameOver) return;

    prepareBossFinish();
    if (!victory) {
        bossMeteorElement.classList.add("is-timeout");
        statusElement.textContent = "制限時間終了";
        scheduleBossSequence(() => {
            bossImpactSurfaceElement.hidden = false;
            bossImpactSurfaceElement.classList.add("is-entering");
        }, 320);
        scheduleBossSequence(() => {
            gameElement.classList.add("is-boss-impacting");
            ballElement.classList.add("is-boss-destroying");
            showBossBurst(ball.x, ball.y, "impact");
        }, 740);
        gameOverTimeoutId = setTimeout(() => showBossResult(false), 1450);
        return;
    }

    statusElement.textContent = "ボスを撃破しました！";
    const boss = getBossPosition();
    const bossRadius = Math.min(window.innerWidth * .78, window.innerHeight * .82) * .5;
    for (let index = 0; index < 5; index += 1) {
        scheduleBossSequence(() => {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * bossRadius * .72;
            showBossBurst(
                boss.x + Math.cos(angle) * radius,
                boss.y + Math.sin(angle) * radius
            );
        }, index * 180);
    }
    scheduleBossSequence(() => {
        bossMeteorElement.style.transform = getComputedStyle(bossMeteorElement).transform;
        showBossBurst(boss.x, boss.y, "final");
        bossMeteorElement.classList.add("is-defeated");
    }, 900);
    gameOverTimeoutId = setTimeout(() => {
        bossMeteorElement.hidden = true;
        showBossResult(true);
    }, 1450);
}

function scheduleUpdate() {
    if (animationFrameId === null) animationFrameId = requestAnimationFrame(update);
}

function update(time) {
    animationFrameId = null;
    const delta = Math.min(time - lastTime, 40);
    lastTime = time;

    if (gameStarted && !gameOver && !paused) {
        if (gameMode === "boss") updateBossAttack(delta);
    }

    if (gameStarted && !gameOver && !paused) {
        if (!ball.dragging) physics(delta);
        updateMeteors(delta);
        if (!gameOver) updatePurpleEffects(delta);
        if (!gameOver) updateProjectiles(delta);
        draw();
        updateAfterimages(delta);
    }
    if (gameStarted && !gameOver && !paused) scheduleUpdate();
}

function startDrag(event) {
    if (gameOver || paused) return;
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    ball.keyboardGrabbed = false;
    ball.dragging = true;
    ball.vx = 0;
    ball.vy = 0;
    attackActive = false;
    ballElement.setPointerCapture(event.pointerId);
}

function trackPointer(event) {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    if (!ball.dragging || gameOver || paused) return;
    ball.x = event.clientX;
    ball.y = event.clientY;
    ball.vx = 0;
    ball.vy = 0;
    draw();
}

function endDrag() {
    if (ball.keyboardGrabbed) return;
    ball.dragging = false;
}

function toggleKeyboardGrab(event) {
    if (event.code === "KeyP" && !event.repeat && gameStarted && !gameOver) {
        event.preventDefault();
        setPauseMenuOpen(!paused);
        return;
    }

    if (event.code !== "Space" || event.repeat || !gameStarted || gameOver || paused) return;
    event.preventDefault();
    ball.keyboardGrabbed = !ball.keyboardGrabbed;
    ball.dragging = ball.keyboardGrabbed;
    if (ball.keyboardGrabbed) {
        ball.x = cursor.x;
        ball.y = cursor.y;
        attackActive = false;
    }
    ball.vx = 0;
    ball.vy = 0;
    statusElement.textContent = ball.keyboardGrabbed ? "Spaceキー:ホールド中" : "Spaceキー:ホールド解除";
    draw();
}

document.getElementById("start-game").addEventListener("click", () => startGame("endless"));
openBossAttackButton.addEventListener("click", () => startGame("boss"));
ballElement.addEventListener("pointerdown", startDrag);
window.addEventListener("pointermove", trackPointer);
window.addEventListener("pointerup", endDrag);
window.addEventListener("keydown", toggleKeyboardGrab);
restartButton.addEventListener("click", retryGame);
bossResultRetryButton.addEventListener("click", retryGame);
bossResultTitleButton.addEventListener("click", returnToTitle);
menuToggleButton.addEventListener("click", () => setPauseMenuOpen(!paused));
resumeButton.addEventListener("click", () => setPauseMenuOpen(false));
menuRestartButton.addEventListener("click", retryGame);
pauseTitleButton.addEventListener("click", returnToTitle);
gameOverTitleButton.addEventListener("click", returnToTitle);
window.addEventListener("resize", setAnchor);
setupAudioSettings();
startBgm();
window.addEventListener("pointerdown", startBgm, { once: true });
window.addEventListener("keydown", startBgm, { once: true });

resetGame();
