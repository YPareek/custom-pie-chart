import template from "./custom-pie-chart.template.js";

const CANVAS_MARGIN = 100;
const INNER_RADIUS = "inner-radius";
const OUTER_RADIUS = "outer-radius";
const ON_CLICK_HANDLER = "on-click";
const PIE_SECTIONS = "pie-sections";
const PIE_LEGENDS_COLOR = "pie-legend-colors";
const RADIUS = "radius";
const STARTING_ANGLE = "starting-angle";

class CustomPieChart extends HTMLElement {
  constructor() {
    super();

    this.interval;
    this.intervalForOuterCIrcle;
    this.timeout;
    this.timeoutIds = [];
    this.timeoutForOuterCIrcle;

    this.container = {};

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.container = this.shadowRoot.querySelector(".pie-chart-container");

    this.pieSections = JSON.parse(this.getAttribute(PIE_SECTIONS));
    this.pieLegendColors = JSON.parse(this.getAttribute(PIE_LEGENDS_COLOR));

    this.startingAngle = parseFloat(this.getAttribute(STARTING_ANGLE));
    this.noOfPieSections = Object.keys(this.pieSections).length;
    this.incrementingAngle = (2 * Math.PI) / (this.noOfPieSections - 1);
    this.isAnimationRunning = false;

    this.innerRadius = parseInt(this.getAttribute(INNER_RADIUS));
    this.radius = parseInt(this.getAttribute(RADIUS));
    this.outerRadius = parseInt(this.getAttribute(OUTER_RADIUS));

    this.attachHtml();

    this.innerCircleElement = this.shadowRoot.getElementById("innerCircle");
    this.outerCircleElement = this.shadowRoot.getElementById("outerCircle");

    this.centerX = this.innerCircleElement.offsetWidth / 2;
    this.centerY = this.innerCircleElement.offsetWidth / 2;

    this.drawPieChart("rgb(176, 174, 175)", "rgb(168, 168, 168)");
    this.container.addEventListener("click", e => this.onClickEventHandler(e));
    this.container.addEventListener("mousemove", e => {
      if (this.getCanvasId(e.offsetX, e.offsetY) >= 0) {
        e.target.style.cursor = "pointer";
      } else {
        e.target.style.cursor = "";
      }
    });

    this.isAnimationRunning = true;
    setTimeout(() => {
      this.isAnimationRunning = false;
      let timeOutId;
      for (let i = 3; i <= 9; i++) {
        if (i == 7) {
          i = 8;
        }
        timeOutId = setTimeout(() => {
          this.onClickEventHandler(undefined, i % 7);
          this.timeoutIds.shift();
        }, 1800 * ((i > 7 ? i - 1 : i) - 3));
        this.timeoutIds.push(timeOutId);
      }
      timeOutId = setTimeout(
        () => this.onClickEventHandler(undefined, 0),
        10800
      );
      this.timeoutIds.push(timeOutId);
    }, 1000);
  }

  attachHtml() {
    this.container.style.height = `${(this.outerRadius + CANVAS_MARGIN) * 2}px`;
    this.container.style.width = `${(this.outerRadius + CANVAS_MARGIN) * 2}px`;

    let innerCircle = document.createElement("canvas"),
      canvasHeight = (this.outerRadius + 5) * 2,
      canvasWidth = (this.outerRadius + 5) * 2;
    innerCircle.id = "innerCircle";
    innerCircle.setAttribute("height", canvasHeight);
    innerCircle.setAttribute("width", canvasWidth);
    innerCircle.classList.add("canvas-styles");

    let outerCircle = document.createElement("canvas");
    outerCircle.id = "outerCircle";
    outerCircle.setAttribute("height", canvasHeight);
    outerCircle.setAttribute("width", canvasWidth);
    outerCircle.classList.add("canvas-styles");

    this.container.appendChild(innerCircle);
    this.container.appendChild(outerCircle);

    for (let i = 1; i < this.noOfPieSections; i++) {
      let canvasSection = document.createElement("canvas");
      canvasSection.id = `pieSectionCanvas${i}`;
      canvasSection.setAttribute("height", canvasHeight);
      canvasSection.setAttribute("width", canvasWidth);
      canvasSection.classList.add("canvas-styles");
      this.container.appendChild(canvasSection);

      let legendBoxDiv = document.createElement("div");
      legendBoxDiv.classList.add("legend-box");
      legendBoxDiv.id = `${this.pieSections[i]}Legend`;
      let barDiv = document.createElement("div");
      barDiv.classList.add("bar", "bar-margins");
      barDiv.style.backgroundColor = this.getColorFromCode(
        this.pieLegendColors[i]
      );
      let titleSpan = document.createElement("span");
      titleSpan.innerText = `${this.pieSections[i]}`;

      legendBoxDiv.appendChild(barDiv);
      legendBoxDiv.appendChild(titleSpan);
      this.container.appendChild(legendBoxDiv);
    }
  }

  updateHtml() {
    this.container.style.height = `${(this.outerRadius + CANVAS_MARGIN) * 2}px`;
    this.container.style.width = `${(this.outerRadius + CANVAS_MARGIN) * 2}px`;
  }

  drawInnerCircle(fillColor, isStrokeNeeded = true) {
    let innerCircle = this.innerCircleElement.getContext("2d"),
      radious = this.innerRadius;

    if (isStrokeNeeded) {
      innerCircle.strokeStyle = "#FF2C6A";
      innerCircle.lineWidth = 3;
      innerCircle.stroke();
    } else {
      radious += 1.2;
    }
    innerCircle.beginPath();
    innerCircle.arc(this.centerX, this.centerY, radious, 0, 2 * Math.PI, false);
    if (fillColor) {
      innerCircle.strokeStyle = fillColor;
      innerCircle.fillStyle = fillColor;
    } else {
      let gradient = innerCircle.createRadialGradient(
        this.centerX - radious,
        this.centerY - radious,
        45,
        this.centerX + radious,
        this.centerY + radious,
        radious
      );
      gradient.addColorStop(0, "#FEA724");
      gradient.addColorStop(1, "#FF1B58");
      innerCircle.fillStyle = gradient;
    }
    innerCircle.fill();
  }

  drawPieChart(
    innerCircleColor,
    outerCircleColor,
    isOuterCircleAnimated = false,
    isInnerCircleStrokeNeeded = true
  ) {
    this.drawInnerCircle(innerCircleColor, isInnerCircleStrokeNeeded);
    if (isOuterCircleAnimated) {
      this.drawOuterCircleWithAnimation(outerCircleColor);
    } else {
      this.drawOuterCircle(outerCircleColor);
    }
    this.drawPieSections();
    this.drawText();
  }

  applyAnimationONlegends(canvasId) {
    let element = this.shadowRoot.getElementById(
      `${this.pieSections[canvasId]}Legend`
    );
    element.children[0].classList.add("bar-red");
    element.classList.remove("legend-box-unselect");
    element.classList.add("legend-box-select");
  }

  dispatchClickEvent(canvasId) {
    this.dispatchEvent(
      new CustomEvent("onPieClick", {
        bubbles: true,
        detail: { canvasId: canvasId }
      })
    );
  }

  drawPieSections() {
    let j = 1;
    for (let i = 1; i < this.noOfPieSections; i++) {
      let canvas = this.shadowRoot.getElementById(`pieSectionCanvas${i}`),
        startingAngle = this.startingAngle + this.incrementingAngle * (i - 1),
        endingAngle = startingAngle + this.incrementingAngle,
        context = canvas.getContext("2d"),
        color = "#FFFFFF";

      // Legend Box Positioning Code
      this.setLegendsPosition(startingAngle, i);

      if (this.noOfPieSections === 7) {
        context.shadowColor = "rgb(0,0,0, 0.09)";
        context.shadowBlur = 24;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 12;

        if (i == 6) {
          context.shadowOffsetY = -12;
        }
        if (i == 1) {
          context.shadowOffsetX = 12;
          context.shadowOffsetY = -12;
        }
        if (i == 4) {
          color = "rgb(0,0,0, 0.02)";
        }
      } else {
        this.setContextShadowDynamically(context, endingAngle);
      }

      context.beginPath();
      context.arc(
        this.centerX,
        this.centerY,
        (this.radius + this.innerRadius + 6) / 2,
        startingAngle,
        endingAngle
      );

      context.lineWidth = this.radius - this.innerRadius - 6;
      context.strokeStyle = color;
      context.stroke();
    }
  }

  setContextShadowDynamically(context, endingAngle) {
    context.shadowColor = "rgb(0,0,0, 0.2)";
    context.shadowBlur = 24;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 12;
    if (0 < endingAngle < Math.PI / 4) {
      context.shadowOffsetX = -12;
      context.shadowOffsetY = +12;
    } else if (Math.PI / 4 < endingAngle < Math.PI / 2) {
      context.shadowOffsetX = -12;
      context.shadowOffsetY = 0;
    } else if (Math.PI / 2 < endingAngle < (3 * Math.PI) / 4) {
      context.shadowOffsetX = -12;
      context.shadowOffsetY = 0;
    } else if ((3 * Math.PI) / 4 < endingAngle < Math.PI) {
      context.shadowOffsetX = 12;
      context.shadowOffsetY = -12;
    } else if (Math.PI < endingAngle < (5 * Math.PI) / 4) {
      context.shadowOffsetX = +12;
      context.shadowOffsetY = -12;
    } else if ((5 * Math.PI) / 4 < endingAngle < (3 * Math.PI) / 2) {
      context.shadowOffsetX = +12;
      context.shadowOffsetY = 0;
    } else if ((5 * Math.PI) / 4 < endingAngle < (3 * Math.PI) / 2) {
      context.shadowOffsetX = 12;
      context.shadowOffsetY = 12;
    } else {
      context.shadowOffsetX = 12;
      context.shadowOffsetY = 12;
    }
  }

  setLegendsPosition(startingAngle, i) {
    let x =
      Math.cos(startingAngle + this.incrementingAngle / 2) > 0
        ? (this.outerRadius + 30) *
          Math.cos(startingAngle + this.incrementingAngle / 2)
        : (this.outerRadius + 30) *
            Math.cos(startingAngle + this.incrementingAngle / 2) -
          30;
    let y =
      Math.sin(startingAngle + this.incrementingAngle / 2) > 0
        ? (this.outerRadius + 25) *
          Math.sin(startingAngle + this.incrementingAngle / 2)
        : (this.outerRadius + 25) *
            Math.sin(startingAngle + this.incrementingAngle / 2) -
          25;
    let xPosition = CANVAS_MARGIN / 5 + this.outerRadius + x;
    let yPosition = CANVAS_MARGIN / 4 + this.outerRadius + y;
    this.shadowRoot
      .getElementById(`${this.pieSections[i]}Legend`)
      .setAttribute("style", `top:${yPosition}px;left:${xPosition}px;`);
  }

  // setTitelBoxPositions() {
  //   for (let i = 1; i < this.noOfPieSections; i++) {
  //     document
  //   .getElementById(`${this.pieSections[i]}Legend`)
  //   .setAttribute('style', `top:${}px;left:${}px;`);
  //   }
  // }

  drawOuterCircle(color) {
    let context = this.outerCircleElement.getContext("2d");
    context.beginPath();
    let radious = this.outerRadius;
    context.arc(this.centerX, this.centerY, radious, 0, 2 * Math.PI, false);
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.stroke();
  }

  drawOuterCircleWithAnimation(color) {
    let a = true,
      radius = this.outerRadius - 6,
      context = this.shadowRoot.getElementById("outerCircle").getContext("2d");

    context.beginPath();
    context.arc(
      this.centerX,
      this.centerY,
      this.outerRadius,
      0,
      2 * Math.PI,
      false
    );
    context.strokeStyle = "white";
    context.lineWidth = 4;
    context.stroke();
    // radius = radius;
    let interval = setInterval(() => {
      if (a) {
        a = false;
      } else {
        context.beginPath();
        context.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI, false);
        context.strokeStyle = "white";
        context.lineWidth = 5;
        context.stroke();
      }

      radius += 0.5;

      context.beginPath();
      context.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI, false);
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.stroke();
    }, 60);

    this.intervalForOuterCIrcle = interval;
    this.timeoutForOuterCIrcle = setTimeout(() => {
      clearInterval(interval);
    }, 900);
  }

  drawText() {
    let canvas = this.shadowRoot.getElementById(
        `pieSectionCanvas${this.noOfPieSections - 1}`
      ),
      context = canvas.getContext("2d");
    context.beginPath();
    context.font = " 24px Nunito Sans";
    context.fillStyle = "#FFFFFF";
    context.fillText(this.pieSections[0], this.centerX - 15, this.centerY + 8);
    context.fill();
  }

  drawWithAnimation(context, colorObj) {
    let color = this.getColorFromCode({ ...colorObj, opacity: 0.06 });
    this.interval = setInterval(() => {
      context.strokeStyle = color;
      context.stroke();
    }, 25);
    this.isAnimationRunning = true;
    this.timeout = setTimeout(() => {
      clearInterval(this.interval);
      this.isAnimationRunning = false;
    }, 1100);
  }

  getColorFromCode(colorObj) {
    if (typeof colorObj == "string") return colorObj;
    if (colorObj.opacity) {
      return `rgb(${colorObj.r},${colorObj.g}, ${colorObj.b}, ${
        colorObj.opacity
      } )`;
    } else {
      return `rgb(${colorObj.r},${colorObj.g}, ${colorObj.b})`;
    }
  }

  getCanvasId(x1, y1) {
    let el = this.innerCircleElement,
      y = el.offsetHeight / 2,
      x = el.offsetWidth / 2,
      pointsDistance = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);

    // console.log(this.centerX, this.centerY, x, y);

    if (pointsDistance < this.innerRadius) return 0;

    if (pointsDistance < this.outerRadius) {
      let angle = Math.asin((y - y1) / pointsDistance);
      // angle += this.startingAngle;
      if (angle > 0) {
        if (x1 < x) {
          angle = Math.PI - angle;
        }
      } else {
        if (x1 > x) {
          angle = Math.PI * 2 + angle;
        } else {
          angle = Math.PI + angle * -1;
        }
      }
      return Math.ceil(
        (2 * Math.PI - angle - this.startingAngle > 0
          ? 2 * Math.PI - angle - this.startingAngle
          : 4 * Math.PI - angle - this.startingAngle) / this.incrementingAngle
      );
    }
  }

  onClickEventHandler(e, canvasIdArg) {
    if (this.isAnimationRunning) {
      clearInterval(this.interval);
      clearInterval(this.intervalForOuterCIrcle);
      clearTimeout(this.timeout);
      clearTimeout(this.timeoutForOuterCIrcle);
      this.isAnimationRunning = false;
      if (e) {
        this.timeoutIds.forEach(id => clearTimeout(id));
      }
    }
    let canvasId = e ? this.getCanvasId(e.offsetX, e.offsetY) : canvasIdArg;
    // console.log(canvasId);

    this.dispatchClickEvent(canvasId);

    if (canvasId == 0) {
      this.clearPie();
      this.removeCssFromLegends();
      this.drawPieChart(undefined, "#ff2C6a", false, false);
    } else {
      let element = this.shadowRoot.getElementById(
          `pieSectionCanvas${canvasId}`
        ),
        startingAngle =
          this.startingAngle + this.incrementingAngle * (canvasId - 1),
        endingAngle = startingAngle + this.incrementingAngle;
      if (element) {
        this.removeCssFromLegends();

        this.applyAnimationONlegends(canvasId);
        let context = element.getContext("2d");
        this.clearPie();
        this.drawPieChart("rgb(176, 174, 175)", "#ff2C6a", false, false);

        this.drawOuterCircleWithAnimation(
          this.getColorFromCode(this.pieLegendColors[canvasId])
        );

        context.shadowColor = "rgb(0,0,0, 0.06)";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;

        context.beginPath();
        context.arc(
          this.centerX,
          this.centerY,
          (this.radius + this.innerRadius + 6) / 2,
          startingAngle,
          endingAngle,
          false
        );
        context.lineWidth = this.radius - this.innerRadius - 6;
        this.drawWithAnimation(context, this.pieLegendColors[canvasId]);
      }
    }
  }

  removeCssFromLegends() {
    for (let i = 1; i < this.noOfPieSections; i++) {
      let legendElement = this.shadowRoot.getElementById(
        `${this.pieSections[i]}Legend`
      );
      legendElement.children[0].classList.remove("bar-red");
      legendElement.classList.remove("legend-box-select");
      legendElement.classList.add("legend-box-unselect");
    }
  }

  clearPie() {
    for (let i = 1; i < this.noOfPieSections; i++) {
      let element = this.shadowRoot.getElementById(`pieSectionCanvas${i}`),
        elementContext = element.getContext("2d");
      elementContext.clearRect(0, 0, element.height, element.width);
    }

    let outerCircle = this.shadowRoot.getElementById("outerCircle");
    outerCircle
      .getContext("2d")
      .clearRect(0, 0, outerCircle.height, outerCircle.width);

    let innerCircle = this.shadowRoot.getElementById("innerCircle");
    innerCircle
      .getContext("2d")
      .clearRect(0, 0, innerCircle.height, innerCircle.width);
  }
}

customElements.define("custom-pie-chart", CustomPieChart);
