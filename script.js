class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.gridSize = 20;
        this.snake = [];
        this.food = {};
        this.specialFood = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameSpeed = 150;
        this.isGameRunning = false;
        this.colors = {
            snakeHead: '#FF6B9C',  // Cute pink
            food: '#00BCD4',
            specialFood: '#FF4081',
            snakeBody: [
                '#FF9ECD', // Light pink
                '#B388FF', // Light purple
                '#82B1FF', // Light blue
                '#80D8FF', // Lighter blue
                '#A7FFEB', // Light teal
                '#FFB2FF', // Pink
                '#FF80AB', // Light pink
                '#EA80FC', // Light purple
                '#8C9EFF', // Light indigo
                '#82B1FF'  // Light blue
            ]
        };
        this.gameOverContainer = null;
        
        // Add intro screen properties
        this.introSnake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 },
            { x: 7, y: 10 },
            { x: 6, y: 10 }
        ];
        this.introDirection = 'right';
        this.introTimer = 0;
        this.introSpeed = 200; // Increased from default speed
        
        this.setupEventListeners();
        this.updateHighScore();
        
        // Show intro screen first
        this.showIntroScreen();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };

        const newDirection = keyMap[event.key];
        if (!newDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    startGame() {
        // Clear any existing game over screen
        const existingContainer = document.querySelector('.game-over-container');
        if (existingContainer) {
            document.body.removeChild(existingContainer);
        }

        // Reset game state
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameSpeed = 150;
        this.isGameRunning = true;
        
        // Clear any existing timeout
        if (this.gameLoopTimeout) {
            clearTimeout(this.gameLoopTimeout);
        }

        this.updateScore();
        this.generateFood();
        this.generateSpecialFood();
        this.gameLoop();
    }

    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
        };
    }

    generateSpecialFood() {
        if (Math.random() < 0.3) { // 30% chance to spawn special food
            this.specialFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } else {
            this.specialFood = null;
        }
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        const scoreContainer = scoreElement.parentElement;
        
        // Update score text
        scoreElement.textContent = this.score;
        
        // Add animation
        scoreContainer.style.animation = 'none';
        scoreContainer.offsetHeight; // Trigger reflow
        scoreContainer.style.animation = 'scoreUpdate 0.3s ease';
        
        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
    }

    updateHighScore() {
        const highScoreElement = document.getElementById('highScore');
        const highScoreContainer = highScoreElement.parentElement;
        
        // Update high score text
        highScoreElement.textContent = this.highScore;
        
        // Add animation
        highScoreContainer.style.animation = 'none';
        highScoreContainer.offsetHeight; // Trigger reflow
        highScoreContainer.style.animation = 'scoreUpdate 0.3s ease';
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Draw circular head
                this.ctx.fillStyle = this.colors.snakeHead;
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();

                // Add eyes based on direction
                const eyePositions = {
                    'right': {
                        x1: segment.x * this.gridSize + this.gridSize * 3/4,
                        x2: segment.x * this.gridSize + this.gridSize * 3/4,
                        y1: segment.y * this.gridSize + this.gridSize * 1/3,
                        y2: segment.y * this.gridSize + this.gridSize * 2/3
                    },
                    'left': {
                        x1: segment.x * this.gridSize + this.gridSize * 1/4,
                        x2: segment.x * this.gridSize + this.gridSize * 1/4,
                        y1: segment.y * this.gridSize + this.gridSize * 1/3,
                        y2: segment.y * this.gridSize + this.gridSize * 2/3
                    },
                    'up': {
                        x1: segment.x * this.gridSize + this.gridSize * 1/3,
                        x2: segment.x * this.gridSize + this.gridSize * 2/3,
                        y1: segment.y * this.gridSize + this.gridSize * 1/4,
                        y2: segment.y * this.gridSize + this.gridSize * 1/4
                    },
                    'down': {
                        x1: segment.x * this.gridSize + this.gridSize * 1/3,
                        x2: segment.x * this.gridSize + this.gridSize * 2/3,
                        y1: segment.y * this.gridSize + this.gridSize * 3/4,
                        y2: segment.y * this.gridSize + this.gridSize * 3/4
                    }
                };

                const pos = eyePositions[this.direction];

                // Draw white part of eyes
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(pos.x1, pos.y1, 4, 0, Math.PI * 2);
                this.ctx.arc(pos.x2, pos.y2, 4, 0, Math.PI * 2);
                this.ctx.fill();

                // Draw black pupils
                this.ctx.fillStyle = 'black';
                this.ctx.beginPath();
                this.ctx.arc(pos.x1, pos.y1, 2, 0, Math.PI * 2);
                this.ctx.arc(pos.x2, pos.y2, 2, 0, Math.PI * 2);
                this.ctx.fill();

                // Add a small highlight to make head look more 3D
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize/3,
                    segment.y * this.gridSize + this.gridSize/3,
                    this.gridSize/4,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            } else {
                // Draw body segments as circles with different colors
                this.ctx.fillStyle = this.colors.snakeBody[index % this.colors.snakeBody.length];
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2 - 2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();

                // Add a small highlight to make circles look more 3D
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(
                    segment.x * this.gridSize + this.gridSize/3,
                    segment.y * this.gridSize + this.gridSize/3,
                    this.gridSize/6,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
    }

    drawFood() {
        const drawApple = (x, y, size, isSpecial = false) => {
            // Draw apple shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.beginPath();
            this.ctx.ellipse(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/1.5,
                this.gridSize/3,
                this.gridSize/6,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Draw apple body with gradient
            const gradient = this.ctx.createRadialGradient(
                x * this.gridSize + this.gridSize/3,
                y * this.gridSize + this.gridSize/3,
                0,
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/2,
                this.gridSize/2
            );
            gradient.addColorStop(0, isSpecial ? '#FF80AB' : '#ff4444');
            gradient.addColorStop(1, isSpecial ? '#FF4081' : '#cc0000');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/2,
                this.gridSize/2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Add shine
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.beginPath();
            this.ctx.ellipse(
                x * this.gridSize + this.gridSize/3,
                y * this.gridSize + this.gridSize/3,
                this.gridSize/6,
                this.gridSize/8,
                -Math.PI/4,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // Draw leaf with gradient
            const leafGradient = this.ctx.createLinearGradient(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/4,
                x * this.gridSize + this.gridSize * 0.7,
                y * this.gridSize + this.gridSize/4
            );
            leafGradient.addColorStop(0, '#4CAF50');
            leafGradient.addColorStop(1, '#81C784');
            
            this.ctx.fillStyle = leafGradient;
            this.ctx.beginPath();
            this.ctx.moveTo(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/4
            );
            
            // Draw curved leaf shape
            this.ctx.bezierCurveTo(
                x * this.gridSize + this.gridSize * 0.7,  // Control point 1 x
                y * this.gridSize + this.gridSize * 0.1,  // Control point 1 y
                x * this.gridSize + this.gridSize * 0.6,  // Control point 2 x
                y * this.gridSize + this.gridSize * 0.2,  // Control point 2 y
                x * this.gridSize + this.gridSize * 0.5,  // End point x
                y * this.gridSize + this.gridSize * 0.3   // End point y
            );
            this.ctx.fill();

            // Add stem
            this.ctx.strokeStyle = '#795548';  // Brown stem
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/4
            );
            this.ctx.lineTo(
                x * this.gridSize + this.gridSize/2,
                y * this.gridSize + this.gridSize/3
            );
            this.ctx.stroke();

            // Add sparkle effect
            if (isSpecial) {
                this.drawSparkle(
                    x * this.gridSize + this.gridSize * 0.7,
                    y * this.gridSize + this.gridSize * 0.3,
                    4
                );
            }
        };

        // Draw regular food (red apple)
        drawApple(this.food.x, this.food.y, this.gridSize);

        // Draw special food if it exists (pink apple)
        if (this.specialFood) {
            drawApple(this.specialFood.x, this.specialFood.y, this.gridSize, true);
        }
    }

    moveSnake() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Only check wall collision
        if (head.x >= this.canvas.width / this.gridSize || 
            head.x < 0 || 
            head.y >= this.canvas.height / this.gridSize || 
            head.y < 0) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            this.generateSpecialFood();
            // Increase speed slightly
            this.gameSpeed = Math.max(50, this.gameSpeed - 2);
        } else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            this.score += 30;
            this.updateScore();
            this.specialFood = null;
            // Grow extra length
            this.snake.push({...this.snake[this.snake.length - 1]});
        } else {
            this.snake.pop();
        }
    }

    gameOver() {
        this.isGameRunning = false;
        
        // Remove existing game over container if it exists
        const existingContainer = document.querySelector('.game-over-container');
        if (existingContainer) {
            document.body.removeChild(existingContainer);
        }

        // Create game over container
        this.gameOverContainer = document.createElement('div');
        this.gameOverContainer.className = 'game-over-container';
        
        // Add game over text with final score
        const gameOverText = document.createElement('div');
        gameOverText.className = 'game-over-text';
        gameOverText.textContent = `Game Over! Score: ${this.score}`;
        
        // Create try again button
        const tryAgainBtn = document.createElement('button');
        tryAgainBtn.className = 'try-again-btn';
        tryAgainBtn.textContent = 'Try Again';
        
        // Add click handler to try again button
        tryAgainBtn.onclick = () => {
            const container = document.querySelector('.game-over-container');
            if (container) {
                document.body.removeChild(container);
            }
            this.startGame();
        };

        // Append elements
        this.gameOverContainer.appendChild(gameOverText);
        this.gameOverContainer.appendChild(tryAgainBtn);
        document.body.appendChild(this.gameOverContainer);

        // Stop the game loop
        if (this.gameLoopTimeout) {
            clearTimeout(this.gameLoopTimeout);
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');  // Sky blue
        gradient.addColorStop(1, '#FFEB3B');  // Yellow
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add subtle pattern
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < this.canvas.width; i += 20) {
            for (let j = 0; j < this.canvas.height; j += 20) {
                this.ctx.beginPath();
                this.ctx.arc(i, j, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        this.clearCanvas();
        this.moveSnake();
        
        // Only draw if the game is still running
        if (this.isGameRunning) {
            this.drawFood();
            this.drawSnake();
            // Store the timeout ID
            this.gameLoopTimeout = setTimeout(() => requestAnimationFrame(() => this.gameLoop()), this.gameSpeed);
        }
    }

    showIntroScreen() {
        // Hide game container initially
        document.querySelector('.game-container').style.display = 'none';
        
        // Create intro container
        const introContainer = document.createElement('div');
        introContainer.className = 'intro-container';
        
        // Create canvas for snake animation
        const introCanvas = document.createElement('canvas');
        introCanvas.id = 'introCanvas';
        introCanvas.width = 400;
        introCanvas.height = 400;
        
        // Create title with custom snake emoji
        const title = document.createElement('div');
        title.className = 'intro-title';
        
        // Create snake emoji container
        const snakeEmoji = document.createElement('span');
        snakeEmoji.className = 'snake-emoji';
        snakeEmoji.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="${this.colors.snakeHead}"/>
                <circle cx="32" cy="20" r="4" fill="white"/>
                <circle cx="32" cy="30" r="4" fill="white"/>
                <circle cx="33" cy="20" r="2" fill="black"/>
                <circle cx="33" cy="30" r="2" fill="black"/>
            </svg>
        `;
        
        title.appendChild(snakeEmoji);
        title.appendChild(document.createTextNode(' Snake Game'));
        
        // Create start button
        const startBtn = document.createElement('button');
        startBtn.className = 'intro-start-btn';
        startBtn.textContent = 'Start Game';
        
        // Append elements
        introContainer.appendChild(title);
        introContainer.appendChild(introCanvas);
        introContainer.appendChild(startBtn);
        document.body.appendChild(introContainer);
        
        // Start intro animation
        this.animateIntro(introCanvas.getContext('2d'), introContainer);
        
        // Add click handler to start button
        startBtn.onclick = () => {
            introContainer.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(introContainer);
                document.querySelector('.game-container').style.display = 'block';
                document.querySelector('.game-container').classList.add('fade-in');
                this.startGame();
            }, 1000);
        };
    }

    animateIntro(ctx, introContainer) {
        const animate = () => {
            if (!document.body.contains(introContainer)) return;
            
            ctx.clearRect(0, 0, 400, 400);
            
            // Add background pattern
            this.drawIntroPattern(ctx);
            
            // Move and draw intro snake
            this.moveIntroSnake();
            this.introSnake.forEach((segment, index) => {
                // Draw segment with gradient
                const gradient = ctx.createRadialGradient(
                    segment.x * this.gridSize + this.gridSize/3,
                    segment.y * this.gridSize + this.gridSize/3,
                    0,
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2
                );
                
                const color = index === 0 ? 
                    this.colors.snakeHead : 
                    this.colors.snakeBody[index % this.colors.snakeBody.length];
                
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, this.darkenColor(color, 20));
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    segment.x * this.gridSize + this.gridSize/2,
                    segment.y * this.gridSize + this.gridSize/2,
                    this.gridSize/2 - 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Add sparkle to head
                if (index === 0 && this.introTimer % 30 === 0) {
                    this.drawSparkle(
                        segment.x * this.gridSize + this.gridSize * 0.7,
                        segment.y * this.gridSize + this.gridSize * 0.3,
                        4
                    );
                }
            });
            
            setTimeout(() => requestAnimationFrame(animate), this.introSpeed);
        };
        
        animate();
    }

    moveIntroSnake() {
        this.introTimer++;
        
        // Change direction less frequently
        if (this.introTimer % 45 === 0) { // Increased from 30 to 45
            const directions = ['up', 'right', 'down', 'left'];
            this.introDirection = directions[Math.floor(Math.random() * directions.length)];
        }
        
        // Only move every few frames to slow down movement
        if (this.introTimer % 3 !== 0) return; // Add delay between movements
        
        const head = { ...this.introSnake[0] };
        
        switch (this.introDirection) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // Wrap around edges
        if (head.x >= 20) head.x = 0;
        if (head.x < 0) head.x = 19;
        if (head.y >= 20) head.y = 0;
        if (head.y < 0) head.y = 19;
        
        this.introSnake.unshift(head);
        this.introSnake.pop();
    }

    // Add sparkle effect method
    drawSparkle(x, y, size) {
        const colors = ['#FFD700', '#FFF', '#FFF9C4'];
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Draw multiple small stars
        for (let i = 0; i < 3; i++) {
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                this.ctx.rotate(Math.PI * 2 / 5);
                this.ctx.lineTo(size * Math.cos(j * 2 * Math.PI / 5), 
                              size * Math.sin(j * 2 * Math.PI / 5));
            }
            this.ctx.fill();
            this.ctx.rotate(Math.PI / 8);
            size *= 0.8;
        }
        
        this.ctx.restore();
    }

    // Helper method to darken colors
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16),
              amt = Math.round(2.55 * percent),
              R = (num >> 16) - amt,
              G = (num >> 8 & 0x00FF) - amt,
              B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
    }

    drawIntroPattern(ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#87CEEB');  // Sky blue
        gradient.addColorStop(1, '#FFEB3B');  // Yellow
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);
        
        // Draw subtle background pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 400; i += 20) {
            for (let j = 0; j < 400; j += 20) {
                ctx.beginPath();
                ctx.arc(i, j, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Initialize the game
const game = new SnakeGame(); 