const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const numElementsInput = document.getElementById('numElements');
const generateButton = document.getElementById('generateButton');
const elementsContainer = document.getElementById('elementsContainer');
const errorMessage = document.createElement('div');
const resultMessage = document.getElementById('result-message');

errorMessage.id = 'error-message';
elementsContainer.appendChild(errorMessage);

// Initially hide the result message
resultMessage.style.display = 'none';

let elements = [];
let currentRotation = 0;

function drawWheel(rotation = 0) {
    const radius = canvas.width / 2;
    const totalChance = elements.reduce((acc, el) => acc + el.chance, 0);
    let startAngle = rotation;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach((element, index) => {
        const angleStep = (2 * Math.PI * element.chance) / totalChance;
        ctx.beginPath();
        ctx.moveTo(radius, radius);
        ctx.arc(radius, radius, radius, startAngle, startAngle + angleStep);
        ctx.fillStyle = element.color;
        ctx.fill();
        ctx.stroke();
        startAngle += angleStep;

        // Draw text in the middle of each slice
        const textAngle = startAngle - angleStep / 2;
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(textAngle);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(element.name, radius - 10, 10);
        ctx.restore();
    });
}

function spinWheel() {
    const totalChance = elements.reduce((acc, el) => acc + el.chance, 0);
    if (totalChance !== 100) {
        const difference = Math.abs(100 - totalChance);
        errorMessage.textContent = totalChance < 100 
            ? `The total percentage is ${difference}% below 100%.` 
            : `The total percentage is ${difference}% above 100%.`;
        errorMessage.style.display = 'block';
        return;
    }
    errorMessage.style.display = 'none';
    resultMessage.style.display = 'none'; // Hide the result message

    // Higher speed and single spin
    const duration = Math.random() * (2 - 0.5) + 0.5;
    const endRotation = currentRotation + 360 * duration * 5; // Rotate even faster

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed < duration * 1000) {
            const rotation = currentRotation + (endRotation - currentRotation) * (elapsed / (duration * 1000));
            canvas.style.transform = `rotate(${rotation}deg)`;
            requestAnimationFrame(animate);
        } else {
            canvas.style.transform = `rotate(${endRotation}deg)`;
            currentRotation = endRotation % 360;

            // Determine the result
            let randomNum = Math.random() * totalChance;
            let accumulatedChance = 0;
            let result;
            elements.forEach((element) => {
                accumulatedChance += element.chance;
                if (randomNum <= accumulatedChance) {
                    result = element.name;
                    return;
                }
            });

            // Display the result
            resultMessage.textContent = `RESULT: ${result}`;
            resultMessage.style.display = 'block'; // Show the result message
        }
    }

    let startTime = null;
    requestAnimationFrame(animate);
}

function generateElements(num) {
    elementsContainer.innerHTML = '';
    elementsContainer.appendChild(errorMessage);
    elements = [];
    for (let i = 0; i < num; i++) {
        const element = {
            name: `Element ${i + 1}`,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            chance: Math.floor(100 / num)
        };
        elements.push(element);

        const elementDiv = document.createElement('div');
        elementDiv.className = 'element-controls';
        elementDiv.innerHTML = `
            <input type="text" value="${element.name}" data-index="${i}" class="element-name">
            <input type="color" value="${element.color}" data-index="${i}" class="element-color">
            <input type="number" value="${element.chance}" min="1" max="100" data-index="${i}" class="element-chance">
            <input type="range" value="${element.chance}" min="1" max="100" data-index="${i}" class="element-chance-slider">
        `;
        elementsContainer.appendChild(elementDiv);
    }

    document.querySelectorAll('.element-name').forEach(input => {
        input.addEventListener('input', updateElement);
    });
    document.querySelectorAll('.element-color').forEach(input => {
        input.addEventListener('input', updateElement);
    });
    document.querySelectorAll('.element-chance').forEach(input => {
        input.addEventListener('input', updateElement);
    });
    document.querySelectorAll('.element-chance-slider').forEach(input => {
        input.addEventListener('input', updateElementFromSlider);
    });

    drawWheel();
}

function updateElement(e) {
    const index = e.target.dataset.index;
    const value = e.target.value;
    if (e.target.classList.contains('element-name')) {
        elements[index].name = value;
    } else if (e.target.classList.contains('element-color')) {
        elements[index].color = value;
    } else if (e.target.classList.contains('element-chance')) {
        elements[index].chance = parseFloat(value);
        document.querySelector(`.element-chance-slider[data-index="${index}"]`).value = value;
    }
    drawWheel();
}

function updateElementFromSlider(e) {
    const index = e.target.dataset.index;
    const value = e.target.value;
    elements[index].chance = parseFloat(value);
    document.querySelector(`.element-chance[data-index="${index}"]`).value = value;
    drawWheel();
}

generateButton.addEventListener('click', () => {
    const numElements = parseInt(numElementsInput.value, 10);
    if (numElements > 0) {
        generateElements(numElements);
    }
});

spinButton.addEventListener('click', spinWheel);
