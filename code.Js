const ballElement = document.getElementById("ball");
const gameElement = document.getElementById("game");
const scoreElement = document.getElementById("score-value");
const speedMeterElement = document.getElementById("speed-meter");
const speedValueElement = document.getElementById("speed-value");
const speedFillElement = document.getElementById("speed-fill");
const statusElement = document.getElementById("status");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const restartButton = document.getElementById("restart");
const pauseMenuElement = document.getElementById("pause-menu");
const menuToggleButton = document.getElementById("menu-toggle");
const resumeButton = document.getElementById("resume");
const menuRestartButton = document.getElementById("menu-restart");
const bgmElement = document.getElementById("bgm");
const titleScreenElement = document.getElementById("title-screen");

const earthRadius = 40;
const meteorRadius = 14;
const projectileRadius = 5;
const attackSpeed = 5;
const maxScoreSpeed = 50.0;
const multiHitBonus = 0.25;
const spring = 0.03;
const damping = 0.12;
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
        spawnChance: 0.005,
        speed: 2.2,
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
let purpleEffects = [];
let afterimages = [];
let scorePopups = [];
let explosions = [];
let score = 0;
let gameOver = false;
let paused = false;
let gameStarted = false;
let gameOverTimeoutId = null;
let lastTime = performance.now();
let spawnTimer = 0;
let nextSpawn = 900;
let afterimageTimer = 0;
let attackHitCount = 0;
let attackActive = false;

function startBgm() {
    bgmElement.play().catch(() => {});
}

function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    titleScreenElement.hidden = true;
    resetGame();
    lastTime = performance.now();
    startBgm();
}

function setAnchor() {
    anchor.x = window.innerWidth / 2;
    anchor.y = window.innerHeight / 2;
}

function resetGame() {
    clearTimeout(gameOverTimeoutId);
    gameOverTimeoutId = null;
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
    spawnTimer = 0;
    nextSpawn = 900;
    attackHitCount = 0;
    attackActive = false;
    clearAfterimages();
    clearScorePopups();
    clearExplosions();
    ballElement.classList.remove("is-destroying");
    scoreElement.textContent = "0";
    statusElement.textContent = "隕石を迎撃しよう (ドラッグまたはSpaceキーで地球を引っ張る)";
    gameOverElement.hidden = true;
    pauseMenuElement.hidden = true;
    menuToggleButton.hidden = false;
    menuToggleButton.setAttribute("aria-expanded", "false");
    meteors.forEach(removeMeteorVisuals);
    meteors = [];
    projectiles.forEach(removeProjectileVisuals);
    projectiles = [];
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

    paused = open;
    pauseMenuElement.hidden = !open;
    menuToggleButton.setAttribute("aria-expanded", String(open));
    menuToggleButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");

    if (open) {
        ball.dragging = false;
        ball.keyboardGrabbed = false;
    }
}

function updateSpeedMeter() {
    const speed = getBallSpeed();
    speedValueElement.textContent = speed.toFixed(1);
    speedFillElement.style.width = `${Math.min(speed / maxMeterSpeed * 100, 100)}%`;
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

function getSpawnPoint(definition) {
    const side = Math.floor(Math.random() * 4);
    const margin = definition.spawnMargin || 42;
    let x;
    let y;

    if (side === 0) {
        x = -margin;
        y = Math.random() * window.innerHeight;
    } else if (side === 1) {
        x = window.innerWidth + margin;
        y = Math.random() * window.innerHeight;
    } else if (side === 2) {
        x = Math.random() * window.innerWidth;
        y = -margin;
    } else {
        x = Math.random() * window.innerWidth;
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

function updateMeteorPosition(meteor, frame, delta) {
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

function createProjectile(x, y, targetX, targetY, speed) {
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

    createProjectile(meteor.x, meteor.y, ball.x, ball.y, meteor.definition.projectileSpeed);
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

function destroyMeteor(meteor) {
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
    const points = meteor.definition.scoreMultiplier * 500;
    score += points;
    scoreElement.textContent = score;
    showScorePopup(meteor.x, meteor.y, points);
    if (meteor.definition.id !== "purple") showExplosion(meteor.x, meteor.y);
    removeMeteorVisuals(meteor);
}

function updateMeteors(delta) {
    const frame = delta / 16.67;
    if (!isAttacking()) attackHitCount = 0;
    spawnTimer += delta;
    if (spawnTimer >= nextSpawn) {
        spawnTimer = 0;
        nextSpawn = 700 + Math.random() * 700;
        spawnMeteor();
    }

    const remainingMeteors = [];
    const destroyedMeteors = new Set();

    meteors.forEach((meteor) => {
        if (destroyedMeteors.has(meteor)) return;
        updateMeteorPosition(meteor, frame, delta);
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
                destroyMeteor(meteor);
                destroyedMeteors.add(meteor);
                if (meteor.definition.clearsScreen) {
                    meteors.forEach((otherMeteor) => {
                        if (otherMeteor === meteor || destroyedMeteors.has(otherMeteor)) return;
                        destroyMeteor(otherMeteor);
                        destroyedMeteors.add(otherMeteor);
                    });
                }
                statusElement.textContent = "迎撃成功！ まとめて破壊したり、ハイスピードで撃墜すると高得点";
                return;
            }
            removeMeteorVisuals(meteor);
            endGame();
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

    meteors = remainingMeteors;
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

    for (const projectile of projectiles) {
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

function update(time) {
    const delta = Math.min(time - lastTime, 40);
    lastTime = time;

    if (gameStarted && !gameOver && !paused) {
        if (!ball.dragging) physics(delta);
        updateMeteors(delta);
        if (!gameOver) updatePurpleEffects(delta);
        if (!gameOver) updateProjectiles(delta);
        draw();
        updateAfterimages(delta);
    }
    requestAnimationFrame(update);
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
    if (event.code === "KeyP" && !event.repeat && !gameOver) {
        event.preventDefault();
        setPauseMenuOpen(!paused);
        return;
    }

    if (event.code !== "Space" || event.repeat || gameOver || paused) return;
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

titleScreenElement.addEventListener("click", startGame);
window.addEventListener("keydown", (event) => {
    if (!gameStarted) {
        event.preventDefault();
        event.stopImmediatePropagation();
        startGame();
    }
}, true);
ballElement.addEventListener("pointerdown", startDrag);
window.addEventListener("pointermove", trackPointer);
window.addEventListener("pointerup", endDrag);
window.addEventListener("keydown", toggleKeyboardGrab);
restartButton.addEventListener("click", resetGame);
menuToggleButton.addEventListener("click", () => setPauseMenuOpen(!paused));
resumeButton.addEventListener("click", () => setPauseMenuOpen(false));
menuRestartButton.addEventListener("click", resetGame);
window.addEventListener("resize", setAnchor);
startBgm();
window.addEventListener("pointerdown", startBgm, { once: true });
window.addEventListener("keydown", startBgm, { once: true });

resetGame();
requestAnimationFrame(update);
