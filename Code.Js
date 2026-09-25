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

const earthRadius = 40;
const meteorRadius = 14;
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
let afterimages = [];
let scorePopups = [];
let score = 0;
let gameOver = false;
let lastTime = performance.now();
let spawnTimer = 0;
let nextSpawn = 900;
let afterimageTimer = 0;
let attackHitCount = 0;

function setAnchor() {
    anchor.x = window.innerWidth / 2;
    anchor.y = window.innerHeight / 2;
}

function resetGame() {
    setAnchor();
    ball.x = anchor.x;
    ball.y = anchor.y;
    ball.vx = 0;
    ball.vy = 0;
    ball.dragging = false;
    ball.keyboardGrabbed = false;
    score = 0;
    gameOver = false;
    spawnTimer = 0;
    nextSpawn = 900;
    attackHitCount = 0;
    clearAfterimages();
    clearScorePopups();
    scoreElement.textContent = "0";
    statusElement.textContent = "隕石を迎撃しよう (ドラッグまたはSpaceキーで地球を引っ張る)";
    gameOverElement.hidden = true;
    meteors.forEach(removeMeteorVisuals);
    meteors = [];
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
    return getBallSpeed() >= attackSpeed;
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
    for (const definition of meteorDefinitions) {
        if (score < (definition.minScore || 0)) continue;
        if (definition.spawnChance && Math.random() < definition.spawnChance) {
            return definition;
        }
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

function getMeteorScore(meteor) {
    const baseScore = getSpeedScore() * meteor.definition.scoreMultiplier;
    const points = Math.round(baseScore * (1 + attackHitCount * multiHitBonus));
    attackHitCount += 1;
    return points;
}

function destroyMeteor(meteor) {
    const points = getMeteorScore(meteor);
    score += points;
    scoreElement.textContent = score;
    showScorePopup(meteor.x, meteor.y, points);
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

        const distance = Math.hypot(meteor.x - ball.x, meteor.y - ball.y);
        if (meteor.definition.movement === "spiral" && meteor.radialDistance <= 0) {
            removeMeteorVisuals(meteor);
            return;
        }
        if (distance <= earthRadius + meteorRadius) {
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

function endGame() {
    gameOver = true;
    meteors.forEach((meteor) => meteor.warningElement?.remove());
    finalScoreElement.textContent = score;
    gameOverElement.hidden = false;
    statusElement.textContent = "地球に隕石が衝突しました";
}

function update(time) {
    const delta = Math.min(time - lastTime, 40);
    lastTime = time;

    if (!gameOver) {
        if (!ball.dragging) physics(delta);
        updateMeteors(delta);
        draw();
        updateAfterimages(delta);
    }
    requestAnimationFrame(update);
}

function startDrag(event) {
    if (gameOver) return;
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    ball.keyboardGrabbed = false;
    ball.dragging = true;
    ball.vx = 0;
    ball.vy = 0;
    ballElement.setPointerCapture(event.pointerId);
}

function trackPointer(event) {
    cursor.x = event.clientX;
    cursor.y = event.clientY;
    if (!ball.dragging || gameOver) return;
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
    if (event.code !== "Space" || event.repeat || gameOver) return;
    event.preventDefault();
    ball.keyboardGrabbed = !ball.keyboardGrabbed;
    ball.dragging = ball.keyboardGrabbed;
    if (ball.keyboardGrabbed) {
        ball.x = cursor.x;
        ball.y = cursor.y;
    }
    ball.vx = 0;
    ball.vy = 0;
    statusElement.textContent = ball.keyboardGrabbed ? "Spaceキー:ホールド中" : "Spaceキー:ホールド解除";
    draw();
}

ballElement.addEventListener("pointerdown", startDrag);
window.addEventListener("pointermove", trackPointer);
window.addEventListener("pointerup", endDrag);
window.addEventListener("keydown", toggleKeyboardGrab);
restartButton.addEventListener("click", resetGame);
window.addEventListener("resize", setAnchor);

resetGame();
requestAnimationFrame(update);