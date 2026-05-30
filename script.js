
        const { Engine, Bodies, Composite, Mouse, MouseConstraint, Body, Sleeping } = Matter;

        const engine = Engine.create({ 
            gravity: { y: 4.5 },
            enableSleeping: false 
        }); 
        const world = engine.world;

        let viewWidth = window.innerWidth;
        let viewHeight = window.innerHeight;
        
        const startX = (viewWidth - 1000) / 2; 
        const startY = 110; 
        let globalZIndexCounter = 100;

        let isGameRunning = false;
        let startTime = 0;
        let timerInterval = null;
        let dropTimeout = null;

        const LAYOUT_CONFIG = [
            { id: 'wf-header', w: 1000, h: 75, x: startX + 500, y: startY + 37.5, html: `<div style="display:flex; width:100%; align-items:center; padding: 0 12px; border-bottom: 4px double #1c1917;"><h1 class="brand-logo">THE DAILY PANIC</h1><div class="header-btn-container"><button class="modern-btn">Subscribe</button></div></div>` },
            { id: 'wf-left-1', w: 260, h: 115, x: startX + 130, y: startY + 142.5, html: `<div class="article-headline-btn"><span class="badge">Breaking</span><h4>Gravity Fluctuations Strike Digital Publishing Matrix</h4><p>Elements begin unpinning dynamically without network notice.</p></div>` },
            { id: 'wf-left-2', w: 260, h: 130, x: startX + 130, y: startY + 275, html: `<div class="article-headline-btn"><span class="badge" style="background:#e0f2fe; color:#0369a1;">Trending</span><h4>Managing System Interface Decay Safely</h4><p>Drag elements back toward baseline tracking arrays to clean scores.</p></div>` },
            { id: 'wf-left-3', w: 260, h: 130, x: startX + 130, y: startY + 415, html: `<div class="article-headline-btn"><span class="badge" style="background:#fef3c7; color:#b45309;">Politics</span><h4>Grid Core Security Demands Immediate Action</h4><p>Emergency restoration teams require user drag deployment instantly.</p></div>` },
            { id: 'wf-left-4', w: 260, h: 115, x: startX + 130, y: startY + 547.5, html: `<div class="article-headline-btn"><span class="badge" style="background:#dcfce7; color:#15803d;">Nature</span><h4>Balancing Dynamics In Broken Sandbox Environments</h4><p>An examination of friction variables under core layout drift loads.</p></div>` },
            { id: 'wf-center-img', w: 500, h: 210, x: startX + 520, y: startY + 190, html: `<div class="image-placeholder">Featured Editorial Documentation Space</div>` },
            { id: 'wf-center-divider', w: 500, h: 45, x: startX + 520, y: startY + 327.5, html: `<div style="text-align:center; font-weight:800; text-transform:uppercase; font-size:11px; letter-spacing:2px; color:#78716c; margin:auto; border-top:1px solid #e7e5e4; border-bottom:1px solid #e7e5e4; padding:4px 0; width:90%;">Opinion & Analysis Matrix</div>` },
            { id: 'wf-center-txt', w: 320, h: 220, x: startX + 430, y: startY + 470, html: `<div class="scrollable-content"><h2 class="card-title">The Unravelling Interface Framework</h2><p class="card-body">As structural nodes drift away from intended destinations, the architectural calibration meter decreases exponentially.</p><p class="card-body">Click and hold layout blocks to physically reset tracking nodes manually.</p></div>` },
            { id: 'wf-center-subimg', w: 165, h: 220, x: startX + 687.5, y: startY + 470, html: `<div class="image-placeholder" style="font-size:10px;">Figure 1.2 Matrix</div>` },
            { id: 'wf-right-ad1', w: 215, h: 265, x: startX + 892.5, y: startY + 217.5, html: `<div class="static-ad-box"><div class="ad-tag">Sponsored</div><div class="image-placeholder" style="background:#fffbeb; color:#b45309; border-color:#fde68a;">Premium Luxury Timepiece</div></div>` },
            { id: 'wf-right-ad2', w: 215, h: 220, x: startX + 892.5, y: startY + 470, html: `<div class="static-ad-box"><div class="ad-tag">Sponsored</div><div class="image-placeholder" style="background:#fffbeb; color:#b45309; border-color:#fde68a;">Cloud Storage Optimization</div></div>` }
        ];

        const containerDom = document.getElementById('newspaper-grid-canvas');
        let uiElements = [];

        LAYOUT_CONFIG.forEach(item => {
            const div = document.createElement('div');
            div.id = item.id;
            div.className = 'physics-ui';
            div.style.width = item.w + 'px';
            div.style.height = item.h + 'px';
            div.innerHTML = item.html;
            containerDom.appendChild(div);

            const body = Bodies.rectangle(item.x, item.y, item.w, item.h, {
                isStatic: true, 
                restitution: 0.1, 
                friction: 0.2, 
                frictionAir: 0.02,
                density: 0.01
            });

            Composite.add(world, body);
            uiElements.push({ 
                dom: div, body: body, w: item.w, h: item.h, 
                origX: item.x, origY: item.y, isFlashing: false 
            });
        });

        const ground = Bodies.rectangle(viewWidth / 2, viewHeight + 25, viewWidth * 2, 50, { isStatic: true, friction: 0.4 });
        const leftWall = Bodies.rectangle(-25, viewHeight / 2, 50, viewHeight * 2, { isStatic: true, friction: 0.4 });
        const rightWall = Bodies.rectangle(viewWidth + 25, viewHeight / 2, 50, viewHeight * 2, { isStatic: true, friction: 0.4 });
        Composite.add(world, [ground, leftWall, rightWall]);

        const mouse = Mouse.create(document.body);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse, constraint: { stiffness: 0.4, angularStiffness: 0.6, render: { visible: false } }
        });
        Composite.add(world, mouseConstraint);

        // --- ALL-TIME DRAG & Z-INDEX ENGINE ---
        Matter.Events.on(mouseConstraint, 'startdrag', function(event) {
            if (!isGameRunning) {
                mouseConstraint.constraint.body = null;
                return;
            }

            const element = uiElements.find(el => el.body === event.body);
            if (element) {
                if (element.isFlashing) {
                    mouseConstraint.constraint.body = null;
                    return;
                }

                globalZIndexCounter++;
                element.dom.style.zIndex = globalZIndexCounter;
                element.dom.classList.add('is-dragging'); // Dynamic glow state

                if (element.body.isSleeping) {
                    Sleeping.set(element.body, false);
                }

                if (element.body.isStatic) {
                    Body.setStatic(element.body, false);
                    Body.setVelocity(element.body, { x: 0, y: 0 });
                    Body.setAngularVelocity(element.body, 0);
                }
            }
        });

        // --- DRAG RELEASE RESET ---
        Matter.Events.on(mouseConstraint, 'enddrag', function(event) {
            const element = uiElements.find(el => el.body === event.body);
            if (element) {
                element.dom.classList.remove('is-dragging');
            }
        });

        // --- ACCURACY AND PROGRESS LOGIC ---
        function calculateLayoutAccuracy() {
            let totalDeviation = 0;
            let maxAllowableDeviationPerElement = 350; 

            uiElements.forEach(element => {
                const currentX = element.body.position.x;
                const currentY = element.body.position.y;
                
                if (isNaN(currentX) || isNaN(currentY)) {
                    Body.setPosition(element.body, { x: element.origX, y: element.origY });
                    Body.setVelocity(element.body, { x: 0, y: 0 });
                    return;
                }

                const distanceGap = Math.sqrt((currentX - element.origX) ** 2 + (currentY - element.origY) ** 2);
                totalDeviation += Math.min(distanceGap, maxAllowableDeviationPerElement);
            });

            const maxPossibleDeviation = uiElements.length * maxAllowableDeviationPerElement;
            let accuracyPercent = Math.round(((maxPossibleDeviation - totalDeviation) / maxPossibleDeviation) * 100);
            
            if (isNaN(accuracyPercent)) accuracyPercent = 100;

            document.getElementById('meter-fill').style.width = accuracyPercent + '%';
            document.getElementById('accuracy-text').innerText = accuracyPercent + '%';

            if (accuracyPercent > 75) document.getElementById('meter-fill').style.backgroundColor = '#059669';
            else if (accuracyPercent > 45) document.getElementById('meter-fill').style.backgroundColor = '#d97706';
            else document.getElementById('meter-fill').style.backgroundColor = '#dc2626';

            if (isGameRunning && accuracyPercent < 30) {
                endGame(false);
            }
        }

        // --- GAMEFLOW CONTROL RIG ---
        function startGame() {
            document.getElementById('start-screen').style.display = 'none';
            isGameRunning = true;
            startTime = Date.now();
            
            timerInterval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const secs = Math.floor(elapsed % 60).toString().padStart(2, '0');
                const ms = Math.floor((elapsed % 1) * 10).toString();
                document.getElementById('game-timer').innerText = `${mins}:${secs}.${ms}`;
            }, 100);

            triggerRandomLayoutCollapse();
        }

        function endGame() {
            isGameRunning = false;
            clearInterval(timerInterval);
            clearTimeout(dropTimeout);

            const finalElapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
            document.getElementById('final-time').innerText = finalElapsedSeconds;

            let recordTime = localStorage.getItem('chronicle_best_time') || 0;
            let isNewRecord = false;

            if (parseFloat(finalElapsedSeconds) > parseFloat(recordTime)) {
                localStorage.setItem('chronicle_best_time', finalElapsedSeconds);
                recordTime = finalElapsedSeconds;
                isNewRecord = true;
            }

            document.getElementById('best-time').innerText = recordTime;
            document.getElementById('record-badge').style.display = isNewRecord ? 'inline-block' : 'none';
            document.getElementById('game-over-screen').style.display = 'flex';

            uiElements.forEach(el => {
                Body.setVelocity(el.body, { x: 0, y: 0 });
                Body.setAngularVelocity(el.body, 0);
                Body.setStatic(el.body, true);
                el.dom.classList.remove('danger-flash');
                el.dom.classList.remove('is-dragging');
                el.dom.style.zIndex = 10;
                el.isFlashing = false;
            });
        }

        function restartGame() {
            document.getElementById('game-over-screen').style.display = 'none';
            document.getElementById('game-timer').innerText = "00:00.0";
            globalZIndexCounter = 100;
            
            uiElements.forEach((element, i) => {
                Body.setStatic(element.body, true);
                Body.setPosition(element.body, { x: element.origX, y: element.origY });
                Body.setAngle(element.body, 0);
                Body.setVelocity(element.body, { x: 0, y: 0 });
                Body.setAngularVelocity(element.body, 0);
                element.dom.className = 'physics-ui';
                element.dom.style.zIndex = 10;
                element.isFlashing = false;
            });

            startGame();
        }

        // --- HIGH-FREQUENCY CLUSTER DROP HAZARD ---
        function triggerRandomLayoutCollapse() {
            if (!isGameRunning) return;

            const staticElements = uiElements.filter(el => el.body.isStatic && !el.isFlashing);
            
            if (staticElements.length > 0) {
                const clusterSize = Math.floor(Math.random() * 3) + 1;
                
                for (let i = 0; i < clusterSize; i++) {
                    const remainingStatic = uiElements.filter(el => el.body.isStatic && !el.isFlashing);
                    if (remainingStatic.length === 0) break;
                    
                    const chosenElement = remainingStatic[Math.floor(Math.random() * remainingStatic.length)];
                    chosenElement.isFlashing = true;
                    
                    const staggeredDelay = i * (Math.random() * 300 + 200); 
                    
                    setTimeout(() => {
                        if (isGameRunning && uiElements.includes(chosenElement)) {
                            chosenElement.dom.classList.add('danger-flash');
                            
                            globalZIndexCounter++;
                            chosenElement.dom.style.zIndex = globalZIndexCounter;
                            
                            setTimeout(() => {
                                if (isGameRunning && uiElements.includes(chosenElement) && chosenElement.isFlashing) {
                                    chosenElement.dom.classList.remove('danger-flash');
                                    chosenElement.isFlashing = false;
                                    Body.setStatic(chosenElement.body, false); 
                                }
                            }, 1000);
                        }
                    }, staggeredDelay);
                }
            }

            const currentElapsed = (Date.now() - startTime) / 1000;
            const difficultyFrequency = Math.max(1500, 4500 - (currentElapsed * 60)); 

            dropTimeout = setTimeout(triggerRandomLayoutCollapse, Math.random() * 2000 + difficultyFrequency);
        }

        // --- REFRESH LOOP ---
        (function update() {
            for (let i = 0; i < 2; i++) {
                Engine.update(engine, (1000 / 60) / 2);
            }

            uiElements.forEach(element => {
                element.dom.style.left = (element.body.position.x - element.w / 2) + 'px';
                element.dom.style.top = (element.body.position.y - element.h / 2) + 'px';
                element.dom.style.transform = `rotate(${element.body.angle}rad)`;
            });

            calculateLayoutAccuracy();
            requestAnimationFrame(update);
        })();

        // Right click pinning configuration
        window.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if (!isGameRunning) return;
            uiElements.forEach(element => {
                if (Matter.Vertices.contains(element.body.vertices, { x: e.clientX, y: e.clientY })) {
                    if (element.isFlashing) return; 
                    if (mouseConstraint.constraint.body === element.body) { mouseConstraint.constraint.body = null; }
                    Body.setVelocity(element.body, { x: 0, y: 0 });
                    Body.setAngularVelocity(element.body, 0);
                    Body.setStatic(element.body, true);
                }
            });
        });

        window.addEventListener('resize', () => {
            viewWidth = window.innerWidth; viewHeight = window.innerHeight;
            Body.setPosition(ground, { x: viewWidth / 2, y: viewHeight + 25 });
            Body.setPosition(rightWall, { x: viewWidth + 25, y: viewHeight / 2 });
        });
