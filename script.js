
const draggableBox = document.getElementById('draggableBox');
const timerElement = document.getElementById('timer');
let isDragging = false;
let timer = 0;
let interval;

draggableBox.addEventListener('mousedown', startDragging);
draggableBox.addEventListener('touchstart', startDragging, { passive: false });

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

function startDragging(event) {
    isDragging = true;
    event.preventDefault();
    startTimer();
}

function drag(event) {
    if (!isDragging) return;

    event.preventDefault();

    let clientX, clientY;
    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const containerRect = document.getElementById('gameContainer').getBoundingClientRect();
    const boxRect = draggableBox.getBoundingClientRect();

    let newLeft = clientX - containerRect.left - boxRect.width / 2;
    let newTop = clientY - containerRect.top - boxRect.height / 2;

    newLeft = Math.max(0, Math.min(containerRect.width - boxRect.width, newLeft));
    newTop = Math.max(0, Math.min(containerRect.height - boxRect.height, newTop));

    draggableBox.style.left = `${newLeft}px`;
    draggableBox.style.top = `${newTop}px`;

    draggableBox.style.backgroundColor = 'green';

}

function stopDragging() {
    isDragging = false;
    draggableBox.style.backgroundColor = 'orange';
    stopTimer();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function startTimer() {
    if (!interval) {
        interval = setInterval(() => {
            timer += 0.01;
            timerElement.textContent = timer.toFixed(2);
        }, 10);
    }
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}