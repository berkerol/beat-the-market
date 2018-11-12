/* global Chart */
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.getElementById('menu').offsetHeight - 10;

let money = 200;
let days = 250; // 250 trading days = 1 year
let price = 50;
let minPrice = 15;
let maxPrice = 200;
let baseChange = 0.01;
let daysPerSecond = 1;
let color = 'rgba(54, 162, 235, ';
let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, color + '0.8)');
gradient.addColorStop(1, color + '0.0)');

let trends = [[-9, 3], [-7, 4], [-7, 4], [-5, 5], [-5, 5], [-5, 5], [-4, 7], [-4, 7], [-3, 9]];
let trendPeriods = [5, 10, 10, 20, 20, 20, 60, 60, 120]; // 20 trading days = 1 month
let volatilities = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 5, 5, 8];
let volatilityPeriods = [5, 10, 10, 20, 20, 20, 60, 60, 120]; // 20 trading days = 1 month

let locked;
let stocks;
let currentMoney;
let currentDay;
let currentPrice;
let trend;
let trendPeriod;
let volatility;
let volatilityPeriod;
let interval;

let chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: gradient,
      borderColor: color + '1.0)',
      pointBackgroundColor: color + '1.0)'
    }]
  },
  options: {
    legend: {
      display: false
    },
    layout: {
      padding: {
        top: 50,
        right: 20
      }
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Time'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Price'
        },
        ticks: {
          callback: function (value, index, values) {
            return '$' + value;
          }
        }
      }]
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        label: function (tooltipItem, data) {
          let change;
          let percentChange;
          if (tooltipItem.index === 0) {
            change = 0;
            percentChange = 0;
          } else {
            let prev = data.datasets[0].data[tooltipItem.index - 1];
            change = tooltipItem.yLabel - prev;
            percentChange = Math.round(change / prev * 10000) / 100;
          }
          return ['Price: $' + Math.round(tooltipItem.yLabel * 100) / 100,
            'Change: ' + (change > 0 ? '+' : '') + Math.round(change * 100) / 100,
            '% Change: ' + (percentChange > 0 ? '+' : '') + percentChange + '%'];
        }
      }
    }
  }
});

document.getElementById('money').value = money;
document.getElementById('days').value = days;
document.getElementById('price').value = price;
document.getElementById('min').value = minPrice;
document.getElementById('max').value = maxPrice;
document.getElementById('change').value = baseChange;
document.getElementById('daysPerSecond').value = daysPerSecond;
restart();
window.addEventListener('resize', resizeHandler);

function save () {
  money = +document.getElementById('money').value;
  days = +document.getElementById('days').value;
  price = +document.getElementById('price').value;
  minPrice = +document.getElementById('min').value;
  maxPrice = +document.getElementById('max').value;
  baseChange = +document.getElementById('change').value;
  daysPerSecond = +document.getElementById('daysPerSecond').value;
}

function reset () {
  updateTrend();
  updateVolatility();
  locked = false;
  stocks = 0;
  currentMoney = money;
  writeMoney();
  currentDay = 1;
  currentPrice = price;
  writePrice();
  chart.data.labels = ['Trading Day ' + currentDay];
  chart.data.datasets[0].data = [currentPrice];
  window.clearInterval(interval);
}

function resetButton () {
  let playButton = document.getElementById('play');
  playButton.setAttribute('onclick', 'if(!locked)play()');
  playButton.setAttribute('accesskey', 'c');
  playButton.innerHTML = '<span class="glyphicon glyphicon-play"></span> <span style="text-decoration: underline">C</span>ontinue';
}

function restart () {
  reset();
  resetButton();
  chart.update();
}

function play () {
  let playButton = document.getElementById('play');
  playButton.setAttribute('onclick', 'if(!locked)pause()');
  playButton.setAttribute('accesskey', 'w');
  playButton.innerHTML = '<span class="glyphicon glyphicon-pause"></span> <span style="text-decoration: underline">W</span>ait';
  animate();
}

function pause () {
  window.clearInterval(interval);
  resetButton();
}

function end () {
  pause();
  locked = true;
  if (stocks > 0) {
    currentMoney += stocks * currentPrice;
    stocks = 0;
    writeMoney();
  }
  for (let i = currentDay; i < days; i++) {
    update();
  }
  chart.update();
  window.setTimeout(function () {
    let currentReturn = currentMoney - money;
    let marketReturn = (currentPrice / price - 1) * money;
    let message = 'YOUR RETURN: ' + (currentReturn > 0 ? '+' : '') + (Math.round(currentReturn * 100) / 100) + '\nMARKET RETURN: ' + (marketReturn > 0 ? '+' : '') + (Math.round(marketReturn * 100) / 100) + '\n';
    if (currentReturn > marketReturn) {
      message += 'CONGRATULATIONS, YOU BEAT THE MARKET!';
    } else if (currentReturn < marketReturn) {
      message += 'WHAT A SHAME, MARKET BEAT YOU!';
    } else {
      message += 'YOU AND MARKET EARNED THE SAME!';
    }
    window.alert(message);
  }, 1000);
}

function animate () {
  interval = window.setInterval(function () {
    update();
    chart.update({
      duration: 900 / daysPerSecond
    });
    if (currentDay >= days) {
      end();
    }
  }, 1000 / daysPerSecond);
}

function buy () {
  if (currentMoney >= currentPrice) {
    stocks++;
    currentMoney -= currentPrice;
    writeMoney();
  } else {
    window.alert('NOT ENOUGH FUNDS!');
  }
}

function sell () {
  if (stocks > 0) {
    stocks--;
    currentMoney += currentPrice;
    writeMoney();
  } else {
    window.alert('NOT ENOUGH STOCKS!');
  }
}

function update () {
  if (currentDay % trendPeriod === 0) {
    updateTrend();
  }
  if (currentDay++ % volatilityPeriod === 0) {
    updateVolatility();
  }
  let change = currentPrice * baseChange * volatility * (Math.random() * (trend[1] - trend[0]) + trend[0]) / 10;
  currentPrice += change;
  if (currentPrice < minPrice) {
    currentPrice += Math.abs(change) * 2;
  } else if (currentPrice > maxPrice) {
    currentPrice -= Math.abs(change) * 2;
  }
  writePrice();
  chart.data.labels.push('Trading Day ' + currentDay);
  chart.data.datasets[0].data.push(currentPrice);
}

function updateTrend () {
  trend = trends[Math.floor(Math.random() * trends.length)];
  trendPeriod = trendPeriods[Math.floor(Math.random() * trendPeriods.length)];
}

function updateVolatility () {
  volatility = volatilities[Math.floor(Math.random() * volatilities.length)];
  volatilityPeriod = volatilityPeriods[Math.floor(Math.random() * volatilityPeriods.length)];
}

function writeMoney () {
  document.getElementById('currentMoney').innerHTML = Math.round(currentMoney * 100) / 100;
  document.getElementById('stocks').innerHTML = stocks;
}

function writePrice () {
  document.getElementById('currentDay').innerHTML = currentDay;
  document.getElementById('currentPrice').innerHTML = Math.round(currentPrice * 100) / 100;
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - document.getElementById('menu').offsetHeight - 10;
  chart.resize();
  chart.update();
}
