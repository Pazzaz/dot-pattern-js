'use strict';

var dPJS = function (tag_id, background_colour, dot_colour) {
    this.background_colour = background_colour;
    this.dot_colour = dot_colour;
    this.container = document.getElementById(tag_id);
    this.canvas = document.getElementById("canvas-" + tag_id);
    this.ctx = this.canvas.getContext("2d");
    this.canvas.height = this.container.offsetHeight.toString();
    this.canvas.width = this.container.offsetWidth.toString();
    this.horizontalDots = (this.container.offsetWidth / 32) + 1;
    this.verticalDots = (this.container.offsetHeight / 32) + 1;


    this.update = () => {
        // Reset the canvas by and draw the background
        this.ctx.fillStyle = this.background_colour;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create all the dots
        let positionX, 
        positionY,
        size,
        distanceX,
        distanceY,
        moveX,
        moveY;
        for (var a = 0; a < this.horizontalDots; a++) {
            for (var b = 0; b < this.verticalDots; b++) {
                this.ctx.beginPath();
                positionX = a * 32;
                positionY = b * 32;
                size = 5;
                if (this.canvas.mouseHover &&
                    Math.abs(positionX - this.canvas.mouseX) < 220 &&
                    Math.abs(positionY - this.canvas.mouseY) < 220
                ) {
                    distanceX = positionX - this.canvas.mouseX;
                    distanceY = positionY - this.canvas.mouseY;
                    if (distanceX == 0) {
                        distanceX = 0.1;
                    }
                    const distanceRatio = Math.abs(distanceY / distanceX);
                    const totalDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
                    const pushDistance = Math.max(200 - totalDistance, 0);

                    moveX = Math.sqrt((pushDistance ** 2) / (1 + (distanceRatio ** 2))) * 0.1;
                    moveY = moveX * distanceRatio;

                    if (positionX - this.canvas.mouseX < 0) {
                        moveX *= -1;
                    }
                    if (positionY - this.canvas.mouseY < 0) {
                        moveY *= -1;
                    }
                    positionX += moveX;
                    positionY += moveY;
                    size += pushDistance / 50;
                }
                this.ctx.fillStyle = this.dot_colour;
                this.ctx.arc(positionX, positionY, size, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    };
    window.requestAnimationFrame(this.update);

    // Move dots with mouse pointer
    this.container.addEventListener("mousemove", (event) => {
        this.canvas.mouseX = event.pageX - this.container.offsetLeft;
        this.canvas.mouseY = event.pageY - this.container.offsetTop;
        this.canvas.mouseHover = true;
        window.requestAnimationFrame(this.update);
    });

    // Reset when the mouse leaves the canvas
    this.container.addEventListener("mouseleave", () => {
        this.canvas.mouseHover = false;
        window.requestAnimationFrame(this.update);
    });
};

window.dotPatternJS = function (tag_id, background_colour, dot_colour) {
    if (!tag_id) {
        tag_id = "dot-pattern-js";
    };
    let canvas = document.createElement("canvas");
    canvas.id = "canvas-" + tag_id;
    let container = document.getElementById(tag_id);
    container.appendChild(canvas);
    new dPJS(tag_id, background_colour, dot_colour);
};