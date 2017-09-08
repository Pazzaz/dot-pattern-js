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
    
    update() {
        // Draw the background
        this.ctx.fillStyle = this.background_colour;
        this.ctx.fillRect(this.canvas.mouseLastX - this.radius, this.canvas.mouseLastY - this.radius, this.radius * 2, this.radius * 2);
        this.ctx.fillRect(this.canvas.mouseX - this.radius, this.canvas.mouseY - this.radius, this.radius * 2, this.radius * 2);

        // Create all the dots
        this.ctx.fillStyle = this.dot_colour;
        for (var dot of this.dots) {
            let mouseDotDistanceX = dot.x - this.canvas.mouseX;
            let mouseDotDistanceY = dot.y - this.canvas.mouseY;
            if (
                Math.abs(mouseDotDistanceX) < this.radius && 
                Math.abs(mouseDotDistanceY) < this.radius
            ){
                dot.drawAffected(this, mouseDotDistanceX, mouseDotDistanceY);
            } else if (
                Math.abs(dot.x - this.canvas.mouseLastX) < this.radius + 20 && 
                Math.abs(dot.y - this.canvas.mouseLastY) < this.radius + 20
            ) {
                /* 
                * Draw normal dots if the dots are in the area that was 
                * affected by the pointer on the last update.
                */
                dot.drawSimple(this);
            }
        }
    }

    resetCanvas() {
        this.ctx.fillStyle = this.background_colour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.dot_colour;
        for (var dot of this.dots) {
            dot.drawSimple(this);
        }
    }

    activate() {
        window.requestAnimationFrame(() => { this.resetCanvas(); });
    
        // Move dots with mouse pointer
        this.container.addEventListener("mousemove", (event) => {
            this.canvas.mouseLastX = this.canvas.mouseX || event.pageX - this.container.offsetLeft;
            this.canvas.mouseLastY = this.canvas.mouseY || event.pageY - this.container.offsetLeft;
            this.canvas.mouseX = event.pageX - this.container.offsetLeft;
            this.canvas.mouseY = event.pageY - this.container.offsetTop;
            window.requestAnimationFrame(() => { this.update(); });
        });
    
        // Reset when the mouse leaves the canvas
        this.container.addEventListener("mouseleave", () => {
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
    
    drawSimple(canvas) {
        canvas.ctx.beginPath();
        canvas.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        canvas.ctx.fill();
    }
    
    drawAffected(canvas, mouseDotDistanceX, mouseDotDistanceY) {
        if (mouseDotDistanceX == 0) {
            mouseDotDistanceX = 0.1;
        }
        const distanceRatio = Math.abs(mouseDotDistanceY / mouseDotDistanceX);
        const totalDistance = Math.hypot(mouseDotDistanceX, mouseDotDistanceY);
        const pushDistance = Math.max(canvas.radius - totalDistance, 0);
        let moveX = Math.sqrt((pushDistance ** 2) /(1 + (distanceRatio ** 2))) * canvas.power;
        let moveY = moveX * distanceRatio;
        if (mouseDotDistanceX < 0) {
            moveX *= -1;
        }
        if (mouseDotDistanceY < 0) {
            moveY *= -1;
        }
        canvas.ctx.beginPath();
        canvas.ctx.arc(this.x + moveX, this.y + moveY, this.size + (pushDistance / 50) * canvas.dotGrow, 0, 2 * Math.PI);
        canvas.ctx.fill();
    }
}

window.dotPatternJS = function (tag_id, background_colour, dot_colour, radius, power, dotSize, dotGrow) {
    if (!tag_id) {
        tag_id = "dot-pattern-js";
    }
    let canvas = document.createElement("canvas");
    canvas.setAttribute("moz-opaque", "");
    canvas.id = "canvas-" + tag_id;
    let container = document.getElementById(tag_id);
    container.appendChild(canvas);
    var pattern = new DPJS(tag_id, background_colour, dot_colour, radius, power, dotSize, dotGrow);
    pattern.createDots();
    pattern.activate();
};