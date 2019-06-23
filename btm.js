/* global Chart */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 38;

const defaultMoney = 200;
const defaultDays = 250; // 250 trading days = 1 year
const defaultPrice = 50;
const defaultMinPrice = 15;
const defaultMaxPrice = 200;
const defaultBaseChange = 0.01;
const defaultDaysPerSecond = 1;
let money = defaultMoney;
let days = defaultDays;
let price = defaultPrice;
let minPrice = defaultMinPrice;
let maxPrice = defaultMaxPrice;
let baseChange = defaultBaseChange;
let daysPerSecond = defaultDaysPerSecond;
const color = 'rgba(54, 162, 235, ';
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, color + '0.8)');
gradient.addColorStop(1, color + '0.0)');

const trends = [[-9, 3], [-7, 4], [-7, 4], [-5, 5], [-5, 5], [-5, 5], [-4, 7], [-4, 7], [-3, 9]];
const trendPeriods = [5, 10, 10, 20, 20, 20, 60, 60, 120]; // 20 trading days = 1 month
const volatilities = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 5, 5, 8];
const volatilityPeriods = [5, 10, 10, 20, 20, 20, 60, 60, 120]; // 20 trading days = 1 month

window.locked = false;
let stocks;
let currentMoney;
let currentDay;
let currentPrice;
let trend;
let trendPeriod;
let volatility;
let volatilityPeriod;
let interval;

const chart = new Chart(ctx, {
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
            const prev = data.datasets[0].data[tooltipItem.index - 1];
            change = tooltipItem.yLabel - prev;
            percentChange = Math.round(change / prev * 10000) / 100;
          }
          return [`Price: $${Math.round(tooltipItem.yLabel * 100) / 100}`,
            `Change: ${change > 0 ? '+' : ''}${Math.round(change * 100) / 100}`,
            `% Change: ${percentChange > 0 ? '+' : ''}${percentChange}%`];
        }
      }
    }
  }
});

resetInputs();
restart();
document.addEventListener('keyup', keyUpHandler);
window.addEventListener('resize', resizeHandler);

function resetInputs () {
  document.getElementById('money').value = money;
  document.getElementById('days').value = days;
  document.getElementById('price').value = price;
  document.getElementById('min').value = minPrice;
  document.getElementById('max').value = maxPrice;
  document.getElementById('change').value = baseChange * 100;
  document.getElementById('daysPerSecond').value = daysPerSecond;
}

window.save = function () {
  money = +document.getElementById('money').value;
  days = +document.getElementById('days').value;
  price = +document.getElementById('price').value;
  minPrice = +document.getElementById('min').value;
  maxPrice = +document.getElementById('max').value;
  baseChange = +document.getElementById('change').value / 100;
  daysPerSecond = +document.getElementById('daysPerSecond').value;
};

function reset () {
  updateTrend();
  updateVolatility();
  window.locked = false;
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
  const playButton = document.getElementById('play');
  playButton.setAttribute('onclick', 'if(!locked)play()');
  playButton.setAttribute('accesskey', 'c');
  playButton.innerHTML = '<i class="fas fa-play"></i> <u>C</u>ontinue';
}

function restart () {
  reset();
  resetButton();
  chart.update();
}

window.play = function () {
  const playButton = document.getElementById('play');
  playButton.setAttribute('onclick', 'if(!locked)pause()');
  playButton.setAttribute('accesskey', 'w');
  playButton.innerHTML = '<i class="fas fa-pause"></i> <u>W</u>ait';
  animate();
};

function pause () {
  window.clearInterval(interval);
  resetButton();
}

function end () {
  pause();
  window.locked = true;
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
    const currentReturn = currentMoney - money;
    const marketReturn = (currentPrice / price - 1) * money;
    let message = `YOUR RETURN: ${currentReturn >= 0 ? '+' : '-'}$${Math.abs(Math.round(currentReturn * 100) / 100)}\nMARKET RETURN: ${marketReturn >= 0 ? '+' : '-'}$${Math.abs(Math.round(marketReturn * 100) / 100)}\n`;
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

window.buy = function () {
  if (currentMoney >= currentPrice) {
    stocks++;
    currentMoney -= currentPrice;
    writeMoney();
  } else {
    window.alert('NOT ENOUGH FUNDS!');
  }
};

window.sell = function () {
  if (stocks > 0) {
    stocks--;
    currentMoney += currentPrice;
    writeMoney();
  } else {
    window.alert('NOT ENOUGH STOCKS!');
  }
};

function update () {
  if (currentDay % trendPeriod === 0) {
    updateTrend();
  }
  if (currentDay++ % volatilityPeriod === 0) {
    updateVolatility();
  }
  const change = currentPrice * baseChange * volatility * (Math.random() * (trend[1] - trend[0]) + trend[0]) / 10;
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

function keyUpHandler (e) {
  if (e.keyCode === 82) {
    money = defaultMoney;
    days = defaultDays;
    price = defaultPrice;
    minPrice = defaultMinPrice;
    maxPrice = defaultMaxPrice;
    baseChange = defaultBaseChange;
    daysPerSecond = defaultDaysPerSecond;
    resetInputs();
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 38;
  chart.resize();
  chart.update();
}
