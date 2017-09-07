'use strict';

class DPJS {
    constructor(tag_id, background_colour, dot_colour, radius, power, dotSize, dotGrow) {
        this.background_colour = background_colour;
        this.dot_colour = dot_colour;
        this.radius = radius;
        this.power = power;
        this.dotSize = dotSize;
        this.dotGrow = dotGrow;
        this.container = document.getElementById(tag_id);
        this.canvas = document.getElementById("canvas-" + tag_id);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.height = this.container.offsetHeight.toString();
        this.canvas.width = this.container.offsetWidth.toString();
        this.dots = [];
    }


    update() {
        // Draw the background
        this.ctx.fillStyle = this.background_colour;
        this.ctx.fillRect(this.canvas.lastMouseX - this.radius, this.canvas.lastMouseY - this.radius, this.radius * 2, this.radius * 2);
        this.ctx.fillRect(this.canvas.mouseX - this.radius, this.canvas.mouseY - this.radius, this.radius * 2, this.radius * 2);

        
        // Create all the dots
        this.ctx.fillStyle = this.dot_colour;
        for (var dot of this.dots) {
            /*
            * Calculate the new positions for the dots in the area affected by
            * the mousepointer.
            */
            if (this.canvas.mouseHover) {
                this.ctx.beginPath();
                if (Math.abs(dot.x - this.canvas.mouseX) < this.radius && Math.abs(dot.y - this.canvas.mouseY) < this.radius) {
                    let distanceX = dot.x - this.canvas.mouseX;
                    let distanceY = dot.y - this.canvas.mouseY;
                    if (distanceX == 0) {
                        distanceX = 0.1;
                    }
                    const distanceRatio = Math.abs(distanceY / distanceX);
                    const totalDistance = Math.hypot(distanceX, distanceY);
                    const pushDistance = Math.max(this.radius - totalDistance, 0);
                    
                    let moveX = Math.sqrt((pushDistance ** 2) / (1 + (distanceRatio ** 2))) * this.power;
                    let moveY = moveX * distanceRatio;
                    
                    if (dot.x - this.canvas.mouseX < 0) {
                        moveX *= -1;
                    }
                    if (dot.y - this.canvas.mouseY < 0) {
                        moveY *= -1;
                    }
                    this.ctx.arc(
                        dot.x + moveX, 
                        dot.y + moveY, 
                        dot.size + (pushDistance / 50) * this.dotGrow, 
                        0, 
                        2 * Math.PI
                    );
                    this.ctx.fill();
                } else if (Math.abs(dot.x - this.canvas.lastMouseX) < this.radius + 20 && Math.abs(dot.y - this.canvas.lastMouseY) < this.radius + 20) {
                    /* 
                     * Draw normal dots if the dots are in the area that was 
                     * affected by the pointer on the last update.
                     */
                    this.ctx.arc(
                        dot.x,
                        dot.y,
                        dot.size, 
                        0,
                        2 * Math.PI
                    );
                    this.ctx.fill();
                }
            }
        }
    }

    resetCanvas() {
        this.ctx.fillStyle = this.background_colour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.dot_colour;
        for (var dot of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(
                dot.x,
                dot.y,
                dot.size, 
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
    }
    
    createDots() {
        let horizontalDots = (this.container.offsetWidth / 32) + 1;
        let verticalDots = (this.container.offsetHeight / 32) + 1;
        for (var a = 0; a < horizontalDots; a++) {
            for (var b = 0; b < verticalDots; b++) {
                this.dots.push(new Dot(a * 32, b * 32, this.dotSize));
            }
        }
        window.requestAnimationFrame(() => { this.update(); });
    }

    activate() {
        window.requestAnimationFrame(() => { this.resetCanvas(); });
    
        // Move dots with mouse pointer
        this.container.addEventListener("mousemove", (event) => {
            this.canvas.lastMouseX = this.canvas.mouseX || event.pageX - this.container.offsetLeft;
            this.canvas.lastMouseY = this.canvas.mouseY || event.pageY - this.container.offsetLeft;
            this.canvas.mouseX = event.pageX - this.container.offsetLeft;
            this.canvas.mouseY = event.pageY - this.container.offsetTop;
            this.canvas.mouseHover = true;
            window.requestAnimationFrame(() => { this.update(); });
        });
    
        // Reset when the mouse leaves the canvas
        this.container.addEventListener("mouseleave", () => {
            this.canvas.mouseHover = false;
            window.requestAnimationFrame(() => { this.resetCanvas(); });
        });
    }
};

class Dot {
    constructor(positionX, positionY, size) {
        this.x = positionX;
        this.y = positionY;
        this.size = size;
    }
}

window.dotPatternJS = function (tag_id, background_colour, dot_colour, radius, power, dotSize, dotGrow) {
    if (!tag_id) {
        tag_id = "dot-pattern-js";
    }
    let canvas = document.createElement("canvas");
    canvas.id = "canvas-" + tag_id;
    let container = document.getElementById(tag_id);
    container.appendChild(canvas);
    var pattern = new DPJS(tag_id, background_colour, dot_colour, radius, power, dotSize, dotGrow);
    pattern.createDots();
    pattern.activate();
};