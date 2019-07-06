const template = document.createElement("template");

template.innerHTML = `
    <style>

    @media only screen and (min-width: 1600px) {
      .pie-chart-container {
        position: relative;
        width: 520px;
        height: 440px;
        margin-top: 70px;
        margin-left: 70px;
      }
      .legend-box-unselect span {
        margin-left: 20px;
        margin-top: 10px;
        font-size: 18px;
        transition: all 0.7s;
      }
      .legend-box-select span {
        margin-left: 20px;
        margin-top: 25px;
        font-size: 24px;
        transition: all 0.7s;
      }
    }
    
    @media only screen and (max-width: 1599px) {
      .pie-chart-container {
        position: relative;
        width: 420px;
        height: 360px;
        margin-top: 50px;
        margin-left: 50px;
      }
      .legend-box-unselect span {
        margin-left: 20px;
        margin-top: 10px;
        font-size: 16px;
        transition: all 0.7s;
      }
      .legend-box-select span {
        margin-left: 20px;
        margin-top: 25px;
        font-size: 20px;
        transition: all 0.7s;
      }
    }

    .canvas-styles {
      position: absolute;
      top: 30px;
      left: 30px;
    }
    
    .bar {
      height: 4px;
      width: 35px;
      margin-bottom: 8px;
      transition: margin-left 0.5s;
    }
    
    .bar {
      margin-left: 20px;
      margin-top: 10px;
    }
    
    .bar-margins {
      margin-left: 20px;
      margin-top: 10px;
    }

    .bar-margin-extended {
      margin-left: 5px;
      transition: all 0.7s;
    }

    .bar-red {
      background-color: rgb(255, 44, 106);
      margin-left: 5px;
      transition: all 0.7s;
    }
    
    .legend-box {
      position: absolute;
      color: #141726;
      font-weight: 900;
      line-height: 24px;
      height: 50px;
      width: 70px;
    }
    

    

    </style>

    <div class="pie-chart-container"></div>
`;

export default template;
