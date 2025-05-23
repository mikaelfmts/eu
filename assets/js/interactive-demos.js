// Demonstrações interativas e melhorias de acessibilidade

// ----- DEMONSTRAÇÕES INTERATIVAS -----
class InteractiveDemos {
    constructor() {
        this.demos = [
            {
                id: 'particle-demo',
                title: 'Sistema de Partículas',
                description: 'Um sistema de partículas dinâmico e interativo criado com JavaScript puro.',
                init: this.initParticleSystem
            },
            {
                id: 'calculator-demo',
                title: 'Calculadora',
                description: 'Uma calculadora simples com interface responsiva.',
                init: this.initCalculator
            },
            {
                id: 'color-picker-demo',
                title: 'Seletor de Cores',
                description: 'Um seletor de cores interativo para experimentar combinações.',
                init: this.initColorPicker
            }
        ];
    }

    init() {
        // Criar a seção de demonstrações se não existir
        let demosSection = document.getElementById('demos');
        
        if (!demosSection) {
            demosSection = document.createElement('section');
            demosSection.id = 'demos';
            
            // Criar a estrutura da seção
            demosSection.innerHTML = `
                <h2>Demonstrações Interativas</h2>
                <p class="section-description">Experimente minhas habilidades em JavaScript</p>
                
                <div class="demos-container">
                    <div class="demo-selection">
                        ${this.demos.map((demo, index) => `
                            <div class="demo-card" data-demo="${demo.id}">
                                <h3>${demo.title}</h3>
                                <p>${demo.description}</p>
                                <button class="demo-button" data-demo="${demo.id}">Iniciar Demo</button>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="demo-preview">
                        <div class="demo-canvas-container">
                            <canvas id="demo-canvas"></canvas>
                        </div>
                        <div class="demo-controls">
                            <h3>Controles</h3>
                            <div id="demo-controls-content"></div>
                            <button id="close-demo">Fechar Demo</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Inserir antes da seção de redes sociais
            const socialsSection = document.querySelector('.redes-sociais');
            if (socialsSection) {
                socialsSection.parentNode.insertBefore(demosSection, socialsSection);
            } else {
                document.body.appendChild(demosSection);
            }
            
            // Adicionar event listeners aos botões de demo
            document.querySelectorAll('.demo-button').forEach(button => {
                button.addEventListener('click', () => {
                    const demoId = button.getAttribute('data-demo');
                    this.loadDemo(demoId);
                });
            });
            
            // Adicionar event listener ao botão de fechar
            document.getElementById('close-demo').addEventListener('click', () => {
                this.closeCurrentDemo();
            });
        }
    }

    loadDemo(demoId) {
        // Encontrar a demo selecionada
        const demo = this.demos.find(d => d.id === demoId);
        
        if (!demo) return;
        
        // Mostrar o container da demo
        document.querySelector('.demo-preview').classList.add('active');
        
        // Mostrar uma mensagem de carregamento
        const canvas = document.getElementById('demo-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Carregando...', canvas.width / 2, canvas.height / 2);
        
        // Inicializar a demo após um pequeno delay (para mostrar a animação)
        setTimeout(() => {
            demo.init(canvas);
        }, 500);
    }

    closeCurrentDemo() {
        // Ocultar o container da demo
        document.querySelector('.demo-preview').classList.remove('active');
        
        // Limpar o canvas
        const canvas = document.getElementById('demo-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Limpar controles
        document.getElementById('demo-controls-content').innerHTML = '';
    }

    // ----- IMPLEMENTAÇÕES DAS DEMOS -----
    
    // Demo 1: Sistema de Partículas
    initParticleSystem(canvas) {
        // Configurar canvas
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        
        // Configurar controles
        const controlsContainer = document.getElementById('demo-controls-content');
        controlsContainer.innerHTML = `
            <div class="control-group">
                <label for="particle-count">Número de partículas:</label>
                <input type="range" id="particle-count" min="10" max="500" value="100" step="10">
                <span id="particle-count-value">100</span>
            </div>
            <div class="control-group">
                <label for="particle-speed">Velocidade:</label>
                <input type="range" id="particle-speed" min="1" max="10" value="3" step="1">
                <span id="particle-speed-value">3</span>
            </div>
            <div class="control-group">
                <label for="connection-distance">Distância de conexão:</label>
                <input type="range" id="connection-distance" min="50" max="200" value="100" step="10">
                <span id="connection-distance-value">100</span>
            </div>
            <div class="control-group">
                <label for="particle-color">Cor:</label>
                <input type="color" id="particle-color" value="#0066ff">
            </div>
        `;
        
        // Event listeners para controles
        document.getElementById('particle-count').addEventListener('input', function() {
            document.getElementById('particle-count-value').textContent = this.value;
            updateParticleCount(parseInt(this.value));
        });
        
        document.getElementById('particle-speed').addEventListener('input', function() {
            document.getElementById('particle-speed-value').textContent = this.value;
            speed = parseInt(this.value);
        });
        
        document.getElementById('connection-distance').addEventListener('input', function() {
            document.getElementById('connection-distance-value').textContent = this.value;
            connectionDistance = parseInt(this.value);
        });
        
        document.getElementById('particle-color').addEventListener('input', function() {
            particleColor = this.value;
        });
        
        // Variáveis do sistema de partículas
        let particles = [];
        let speed = 3;
        let connectionDistance = 100;
        let particleColor = '#0066ff';
        
        // Criar partículas
        function createParticles(count) {
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * speed,
                    vy: (Math.random() - 0.5) * speed,
                    radius: Math.random() * 3 + 2
                });
            }
        }
        
        // Atualizar número de partículas
        function updateParticleCount(count) {
            createParticles(count);
        }
        
        // Criar partículas iniciais
        createParticles(100);
        
        // Mouse interaction
        let mouse = {
            x: undefined,
            y: undefined,
            radius: 150
        };
        
        canvas.addEventListener('mousemove', function(e) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        canvas.addEventListener('mouseleave', function() {
            mouse.x = undefined;
            mouse.y = undefined;
        });
        
        // Função de animação
        function animate() {
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar fundo
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Atualizar e desenhar partículas
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                
                // Verificar interação com mouse
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouse.radius - distance) / mouse.radius;
                        p.vx += Math.cos(angle) * force * 0.5;
                        p.vy += Math.sin(angle) * force * 0.5;
                    }
                }
                
                // Mover partículas
                p.x += p.vx;
                p.y += p.vy;
                
                // Verificar bordas
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                
                // Restringir velocidade
                const maxSpeed = speed * 1.5;
                const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (currentSpeed > maxSpeed) {
                    p.vx = (p.vx / currentSpeed) * maxSpeed;
                    p.vy = (p.vy / currentSpeed) * maxSpeed;
                }
                
                // Desenhar partículas
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();
                
                // Conectar partículas próximas
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = particleColor + Math.floor((1 - distance / connectionDistance) * 99).toString(16).padStart(2, '0');
                        ctx.stroke();
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        // Iniciar animação
        animate();
        
        // Lidar com redimensionamento
        window.addEventListener('resize', () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 400;
        });
    }
    
    // Demo 2: Calculadora
    initCalculator(canvas) {
        // Configurar canvas
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;
        
        // Configurar controles
        const controlsContainer = document.getElementById('demo-controls-content');
        controlsContainer.innerHTML = `
            <div class="calculator">
                <div class="calculator-display">
                    <div id="calc-history"></div>
                    <div id="calc-current">0</div>
                </div>
                <div class="calculator-buttons">
                    <button class="calc-btn calc-btn-clear">C</button>
                    <button class="calc-btn calc-btn-op">(</button>
                    <button class="calc-btn calc-btn-op">)</button>
                    <button class="calc-btn calc-btn-op">/</button>
                    
                    <button class="calc-btn calc-btn-num">7</button>
                    <button class="calc-btn calc-btn-num">8</button>
                    <button class="calc-btn calc-btn-num">9</button>
                    <button class="calc-btn calc-btn-op">*</button>
                    
                    <button class="calc-btn calc-btn-num">4</button>
                    <button class="calc-btn calc-btn-num">5</button>
                    <button class="calc-btn calc-btn-num">6</button>
                    <button class="calc-btn calc-btn-op">-</button>
                    
                    <button class="calc-btn calc-btn-num">1</button>
                    <button class="calc-btn calc-btn-num">2</button>
                    <button class="calc-btn calc-btn-num">3</button>
                    <button class="calc-btn calc-btn-op">+</button>
                    
                    <button class="calc-btn calc-btn-num zero">0</button>
                    <button class="calc-btn calc-btn-num">.</button>
                    <button class="calc-btn calc-btn-equals">=</button>
                </div>
            </div>
        `;
        
        // Variáveis da calculadora
        let currentInput = '';
        let currentExpression = '';
        const historyElement = document.getElementById('calc-history');
        const currentElement = document.getElementById('calc-current');
        
        // Event listeners
        document.querySelectorAll('.calc-btn-num').forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                
                // Não permitir múltiplos pontos decimais
                if (value === '.' && currentInput.includes('.')) return;
                
                currentInput += value;
                updateDisplay();
            });
        });
        
        document.querySelectorAll('.calc-btn-op').forEach(button => {
            button.addEventListener('click', () => {
                const operator = button.textContent;
                
                if (currentInput !== '') {
                    currentExpression += currentInput;
                    currentInput = '';
                }
                
                currentExpression += operator;
                updateDisplay();
            });
        });
        
        document.querySelector('.calc-btn-clear').addEventListener('click', () => {
            currentInput = '';
            currentExpression = '';
            updateDisplay();
        });
        
        document.querySelector('.calc-btn-equals').addEventListener('click', () => {
            if (currentInput !== '') {
                currentExpression += currentInput;
                currentInput = '';
            }
            
            try {
                // Aviso: eval() é usado aqui apenas para fins educacionais
                // Em aplicações reais, use uma biblioteca matemática segura
                const result = eval(currentExpression);
                
                historyElement.textContent = currentExpression + ' =';
                currentExpression = '';
                currentInput = String(result);
                updateDisplay();
            } catch (error) {
                currentElement.textContent = 'Erro';
                currentExpression = '';
                currentInput = '';
            }
        });
        
        // Função de atualização do display
        function updateDisplay() {
            if (currentInput === '') {
                currentElement.textContent = currentExpression || '0';
            } else {
                currentElement.textContent = currentInput;
            }
            
            historyElement.textContent = currentExpression;
        }
        
        // Inicializar display
        updateDisplay();
    }
    
    // Demo 3: Seletor de Cores
    initColorPicker(canvas) {
        // Configurar canvas
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 400;
        
        const ctx = canvas.getContext('2d');
        
        // Configurar controles
        const controlsContainer = document.getElementById('demo-controls-content');
        controlsContainer.innerHTML = `
            <div class="color-picker">
                <div class="color-sliders">
                    <div class="slider-group">
                        <label for="color-red">R</label>
                        <input type="range" id="color-red" min="0" max="255" value="0">
                        <span id="color-red-value">0</span>
                    </div>
                    <div class="slider-group">
                        <label for="color-green">G</label>
                        <input type="range" id="color-green" min="0" max="255" value="102">
                        <span id="color-green-value">102</span>
                    </div>
                    <div class="slider-group">
                        <label for="color-blue">B</label>
                        <input type="range" id="color-blue" min="0" max="255" value="255">
                        <span id="color-blue-value">255</span>
                    </div>
                    <div class="slider-group">
                        <label for="color-hue">Matiz</label>
                        <input type="range" id="color-hue" min="0" max="360" value="210">
                        <span id="color-hue-value">210</span>
                    </div>
                    <div class="slider-group">
                        <label for="color-saturation">Saturação</label>
                        <input type="range" id="color-saturation" min="0" max="100" value="100">
                        <span id="color-saturation-value">100%</span>
                    </div>
                    <div class="slider-group">
                        <label for="color-lightness">Luminosidade</label>
                        <input type="range" id="color-lightness" min="0" max="100" value="50">
                        <span id="color-lightness-value">50%</span>
                    </div>
                </div>
                <div class="color-preview">
                    <div id="color-preview-box"></div>
                    <div class="color-values">
                        <div id="rgb-value">rgb(0, 102, 255)</div>
                        <div id="hex-value">#0066ff</div>
                        <div id="hsl-value">hsl(210, 100%, 50%)</div>
                    </div>
                </div>
                <div class="color-palette">
                    <h4>Paleta de Cores</h4>
                    <div id="color-scheme"></div>
                </div>
            </div>
        `;
        
        // Variáveis do seletor de cores
        let r = 0, g = 102, b = 255;
        let h = 210, s = 100, l = 50;
        
        // Event listeners para controles RGB
        document.getElementById('color-red').addEventListener('input', function() {
            r = parseInt(this.value);
            document.getElementById('color-red-value').textContent = r;
            updateFromRGB();
        });
        
        document.getElementById('color-green').addEventListener('input', function() {
            g = parseInt(this.value);
            document.getElementById('color-green-value').textContent = g;
            updateFromRGB();
        });
        
        document.getElementById('color-blue').addEventListener('input', function() {
            b = parseInt(this.value);
            document.getElementById('color-blue-value').textContent = b;
            updateFromRGB();
        });
        
        // Event listeners para controles HSL
        document.getElementById('color-hue').addEventListener('input', function() {
            h = parseInt(this.value);
            document.getElementById('color-hue-value').textContent = h;
            updateFromHSL();
        });
        
        document.getElementById('color-saturation').addEventListener('input', function() {
            s = parseInt(this.value);
            document.getElementById('color-saturation-value').textContent = s + '%';
            updateFromHSL();
        });
        
        document.getElementById('color-lightness').addEventListener('input', function() {
            l = parseInt(this.value);
            document.getElementById('color-lightness-value').textContent = l + '%';
            updateFromHSL();
        });
        
        // Funções de atualização
        function updateFromRGB() {
            // Atualizar controles HSL
            const hslValues = rgbToHsl(r, g, b);
            h = Math.round(hslValues.h);
            s = Math.round(hslValues.s * 100);
            l = Math.round(hslValues.l * 100);
            
            document.getElementById('color-hue').value = h;
            document.getElementById('color-hue-value').textContent = h;
            document.getElementById('color-saturation').value = s;
            document.getElementById('color-saturation-value').textContent = s + '%';
            document.getElementById('color-lightness').value = l;
            document.getElementById('color-lightness-value').textContent = l + '%';
            
            updatePreview();
        }
        
        function updateFromHSL() {
            // Atualizar controles RGB
            const rgbValues = hslToRgb(h / 360, s / 100, l / 100);
            r = rgbValues.r;
            g = rgbValues.g;
            b = rgbValues.b;
            
            document.getElementById('color-red').value = r;
            document.getElementById('color-red-value').textContent = r;
            document.getElementById('color-green').value = g;
            document.getElementById('color-green-value').textContent = g;
            document.getElementById('color-blue').value = b;
            document.getElementById('color-blue-value').textContent = b;
            
            updatePreview();
        }
        
        function updatePreview() {
            const hexValue = rgbToHex(r, g, b);
            const rgbStr = `rgb(${r}, ${g}, ${b})`;
            const hslStr = `hsl(${h}, ${s}%, ${l}%)`;
            
            // Atualizar elementos visuais
            document.getElementById('color-preview-box').style.backgroundColor = rgbStr;
            document.getElementById('rgb-value').textContent = rgbStr;
            document.getElementById('hex-value').textContent = hexValue;
            document.getElementById('hsl-value').textContent = hslStr;
            
            // Gerar esquema de cores
            generateColorScheme();
            
            // Desenhar gradientes no canvas
            drawGradients();
        }
        
        function generateColorScheme() {
            const schemeContainer = document.getElementById('color-scheme');
            schemeContainer.innerHTML = '';
            
            // Gerar cores análogas
            const analogous1 = (h - 30 + 360) % 360;
            const analogous2 = (h + 30) % 360;
            
            // Gerar cor complementar
            const complementary = (h + 180) % 360;
            
            // Gerar cores triádicas
            const triadic1 = (h + 120) % 360;
            const triadic2 = (h + 240) % 360;
            
            // Criar swatches
            const colors = [
                { name: 'Principal', h: h },
                { name: 'Análoga 1', h: analogous1 },
                { name: 'Análoga 2', h: analogous2 },
                { name: 'Complementar', h: complementary },
                { name: 'Triádica 1', h: triadic1 },
                { name: 'Triádica 2', h: triadic2 }
            ];
            
            colors.forEach(color => {
                const rgbValue = hslToRgb(color.h / 360, s / 100, l / 100);
                const hexValue = rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b);
                
                const swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = hexValue;
                swatch.title = color.name + '\n' + hexValue;
                
                schemeContainer.appendChild(swatch);
            });
        }
        
        function drawGradients() {
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar gradiente de matiz
            const hueHeight = 60;
            const hueGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            
            for (let i = 0; i <= 1; i += 1/12) {
                const hue = Math.floor(i * 360);
                const color = `hsl(${hue}, 100%, 50%)`;
                hueGradient.addColorStop(i, color);
            }
            
            ctx.fillStyle = hueGradient;
            ctx.fillRect(0, 0, canvas.width, hueHeight);
            
            // Marcar a matiz atual
            const huePosition = (h / 360) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(huePosition, 0);
            ctx.lineTo(huePosition, hueHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Desenhar gradiente de saturação
            const satHeight = 60;
            const satY = hueHeight + 20;
            const satGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            
            for (let i = 0; i <= 1; i += 0.1) {
                const color = `hsl(${h}, ${i * 100}%, 50%)`;
                satGradient.addColorStop(i, color);
            }
            
            ctx.fillStyle = satGradient;
            ctx.fillRect(0, satY, canvas.width, satHeight);
            
            // Marcar a saturação atual
            const satPosition = (s / 100) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(satPosition, satY);
            ctx.lineTo(satPosition, satY + satHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Desenhar gradiente de luminosidade
            const lightY = satY + satHeight + 20;
            const lightHeight = 60;
            const lightGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            
            for (let i = 0; i <= 1; i += 0.1) {
                const color = `hsl(${h}, ${s}%, ${i * 100}%)`;
                lightGradient.addColorStop(i, color);
            }
            
            ctx.fillStyle = lightGradient;
            ctx.fillRect(0, lightY, canvas.width, lightHeight);
            
            // Marcar a luminosidade atual
            const lightPosition = (l / 100) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(lightPosition, lightY);
            ctx.lineTo(lightPosition, lightY + lightHeight);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Desenhar a cor atual
            const currentColorY = lightY + lightHeight + 40;
            const colorHeight = 100;
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, currentColorY, canvas.width, colorHeight);
            
            // Adicionar texto
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.fillText('Matiz (H)', 10, hueHeight + 14);
            ctx.fillText('Saturação (S)', 10, satY + satHeight + 14);
            ctx.fillText('Luminosidade (L)', 10, lightY + lightHeight + 14);
            ctx.fillText('Cor Atual', 10, currentColorY + colorHeight + 14);
        }
        
        // Funções de conversão de cores
        function rgbToHex(r, g, b) {
            return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }
        
        function componentToHex(c) {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }
        
        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0; // acromático
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                
                h /= 6;
            }
            
            return { h: h * 360, s: s, l: l };
        }
        
        function hslToRgb(h, s, l) {
            let r, g, b;
            
            if (s === 0) {
                r = g = b = l; // acromático
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
        
        // Inicializar aplicação
        updatePreview();
    }
}

// ----- MELHORIAS DE ACESSIBILIDADE -----
class AccessibilityManager {
    constructor() {
        this.contrastMode = false;
        this.focusOutline = true;
        this.textZoom = 0; // 0 = normal, +/- 1, 2, 3 para aumento/diminuição
        this.reduceMotion = false;
    }

    init() {
        // Carregar configurações salvas
        this.loadSettings();
        
        // Adicionar botão de acessibilidade se não existir
        if (!document.getElementById('accessibility-btn')) {
            this.createAccessibilityControls();
        }
        
        // Aplicar configurações iniciais
        this.applySettings();
        
        // Adicionar funcionalidades de acessibilidade ao DOM
        this.enhanceDOMAccessibility();
    }

    createAccessibilityControls() {
        // Criar botão de acessibilidade
        const accessibilityBtn = document.createElement('button');
        accessibilityBtn.id = 'accessibility-btn';
        accessibilityBtn.className = 'accessibility-btn';
        accessibilityBtn.innerHTML = '<i class="fas fa-universal-access"></i>';
        accessibilityBtn.setAttribute('aria-label', 'Abrir configurações de acessibilidade');
        accessibilityBtn.setAttribute('title', 'Configurações de acessibilidade');
        
        // Adicionar ao DOM (ao lado do botão de tema)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle && themeToggle.parentNode) {
            themeToggle.parentNode.insertBefore(accessibilityBtn, themeToggle);
        } else {
            document.body.appendChild(accessibilityBtn);
        }
        
        // Criar painel de configurações
        const accessibilityPanel = document.createElement('div');
        accessibilityPanel.id = 'accessibility-panel';
        accessibilityPanel.className = 'accessibility-panel';
        accessibilityPanel.innerHTML = `
            <div class="accessibility-header">
                <h3>Configurações de Acessibilidade</h3>
                <button id="close-accessibility" aria-label="Fechar painel de acessibilidade">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="accessibility-options">
                <div class="accessibility-option">
                    <label for="high-contrast">Alto Contraste</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="high-contrast" ${this.contrastMode ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
                <div class="accessibility-option">
                    <label for="focus-outline">Destacar Foco</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="focus-outline" ${this.focusOutline ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
                <div class="accessibility-option">
                    <label for="reduce-motion">Reduzir Animações</label>
                    <div class="toggle-switch">
                        <input type="checkbox" id="reduce-motion" ${this.reduceMotion ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </div>
                </div>
                <div class="accessibility-option">
                    <label>Tamanho do Texto</label>
                    <div class="text-size-controls">
                        <button id="decrease-text" aria-label="Diminuir texto">A-</button>
                        <span id="text-size-value">Normal</span>
                        <button id="increase-text" aria-label="Aumentar texto">A+</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(accessibilityPanel);
        
        // Adicionar event listeners
        accessibilityBtn.addEventListener('click', () => {
            accessibilityPanel.classList.toggle('open');
        });
        
        document.getElementById('close-accessibility').addEventListener('click', () => {
            accessibilityPanel.classList.remove('open');
        });
        
        document.getElementById('high-contrast').addEventListener('change', (e) => {
            this.contrastMode = e.target.checked;
            this.applySettings();
            this.saveSettings();
        });
        
        document.getElementById('focus-outline').addEventListener('change', (e) => {
            this.focusOutline = e.target.checked;
            this.applySettings();
            this.saveSettings();
        });
        
        document.getElementById('reduce-motion').addEventListener('change', (e) => {
            this.reduceMotion = e.target.checked;
            this.applySettings();
            this.saveSettings();
        });
        
        document.getElementById('increase-text').addEventListener('click', () => {
            if (this.textZoom < 3) {
                this.textZoom++;
                this.updateTextSizeDisplay();
                this.applySettings();
                this.saveSettings();
            }
        });
        
        document.getElementById('decrease-text').addEventListener('click', () => {
            if (this.textZoom > -2) {
                this.textZoom--;
                this.updateTextSizeDisplay();
                this.applySettings();
                this.saveSettings();
            }
        });
    }

    loadSettings() {
        const settings = localStorage.getItem('accessibilitySettings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            this.contrastMode = parsedSettings.contrastMode || false;
            this.focusOutline = parsedSettings.focusOutline !== undefined ? parsedSettings.focusOutline : true;
            this.textZoom = parsedSettings.textZoom || 0;
            this.reduceMotion = parsedSettings.reduceMotion || false;
        }
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify({
            contrastMode: this.contrastMode,
            focusOutline: this.focusOutline,
            textZoom: this.textZoom,
            reduceMotion: this.reduceMotion
        }));
    }

    updateTextSizeDisplay() {
        const textSizeElement = document.getElementById('text-size-value');
        if (!textSizeElement) return;
        
        const textSizes = {
            '-2': 'Muito Pequeno',
            '-1': 'Pequeno',
            '0': 'Normal',
            '1': 'Grande',
            '2': 'Maior',
            '3': 'Muito Grande'
        };
        
        textSizeElement.textContent = textSizes[this.textZoom.toString()];
    }

    applySettings() {
        // Remover classes existentes
        document.body.classList.remove('high-contrast', 'no-focus-outline', 'reduce-motion');
        document.body.classList.remove('text-zoom-n2', 'text-zoom-n1', 'text-zoom-0', 'text-zoom-1', 'text-zoom-2', 'text-zoom-3');
        
        // Aplicar alto contraste
        if (this.contrastMode) {
            document.body.classList.add('high-contrast');
        }
        
        // Aplicar destaque de foco
        if (!this.focusOutline) {
            document.body.classList.add('no-focus-outline');
        }
        
        // Aplicar zoom de texto
        document.body.classList.add(`text-zoom-${this.textZoom < 0 ? 'n' + Math.abs(this.textZoom) : this.textZoom}`);
        
        // Aplicar redução de movimento
        if (this.reduceMotion) {
            document.body.classList.add('reduce-motion');
        }
    }

    enhanceDOMAccessibility() {
        // Garantir que todos os botões tenham atributo aria-label
        document.querySelectorAll('button').forEach(button => {
            if (!button.hasAttribute('aria-label') && button.textContent.trim()) {
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });
        
        // Adicionar atributos ARIA para melhorar navegação
        document.querySelectorAll('section').forEach(section => {
            const headingElement = section.querySelector('h2, h3, h4');
            if (headingElement) {
                const id = headingElement.textContent.toLowerCase().replace(/\s+/g, '-');
                section.setAttribute('aria-labelledby', id);
                headingElement.id = id;
            }
        });
        
        // Adicionar papel de navegação ao menu
        const menu = document.getElementById('menu-lateral');
        if (menu) {
            menu.setAttribute('role', 'navigation');
            menu.setAttribute('aria-label', 'Menu principal');
        }
        
        // Melhorar botão de tema com informações de acessibilidade
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.setAttribute('aria-label', 'Alternar tema claro/escuro');
        }
    }
}

// Inicializar demonstrações interativas e acessibilidade
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar demonstrações interativas
    const demos = new InteractiveDemos();
    demos.init();
    
    // Inicializar gerenciador de acessibilidade
    const accessibilityManager = new AccessibilityManager();
    accessibilityManager.init();
    
    // Expor globalmente para uso em outros scripts
    window.demos = demos;
    window.accessibilityManager = accessibilityManager;
});
