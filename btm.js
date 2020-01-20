/* global Chart createHeaderMenuRow createModalButton createModal keyUpHandler canvas ctx containerElements defaultDays defaultPrice defaultMinPrice defaultMaxPrice defaultBaseChange defaultDaysPerSecond color gradient days:writable price:writable minPrice:writable maxPrice:writable baseChange:writable daysPerSecond:writable currentDay:writable currentPrice:writable trend trendPeriod volatility volatilityPeriod interval:writable updateTrend updateVolatility resizeHandler */
const defaultMoney = 200;

let money;

let stocks;
let currentMoney;

const modalElements = [[['Total Days', 'days', 3, 999, 'number'], ['Possible Min Price', 'min', 1, 9999, 'number'], ['Base Change', 'change', 0, 100, 'number']], [['Initial Price', 'price', 1, 9999, 'number'], ['Possible Max Price', 'max', 1, 9999, 'number'], ['Days/Second', 'daysPerSecond', 1, 9, 'number']], [['Initial Money', 'money', 1, 99999, 'number']]];
const headerElements = ['h5', 'my-auto', '<span>Money: $<span id="currentMoney"></span></span><span class="ml-4 mr-4">Stocks: <span id="stocks"></span></span><span>Day: <span id="currentDay"></span></span><span class="ml-4 mr-4">Price: $<span id="currentPrice"></span></span>'];
const buttonElements = [['success', 'if(!locked)buy()', 'b', 'check', '<u>B</u>uy'], ['danger', 'if(!locked)sell()', 's', 'times', '<u>S</u>ell'], ['primary', 'if(!locked)play()', 'c', 'play', '<u>C</u>ontinue'], ['warning', 'if(!locked)end()', 'e', 'fast-forward', '<u>E</u>nd'], ['info', 'restart()', 'r', 'sync', '<u>R</u>estart'], ['info', '', 't', 'cog', 'Se<u>t</u>tings']];
const header = createHeaderMenuRow('d-flex justify-content-center', 'btn-group', headerElements, buttonElements);
const buttonGroup = header.children[1];
const playButton = buttonGroup.children[2];
createModalButton(buttonGroup, 5);
document.getElementsByClassName('container')[0].appendChild(header);
createModal(modalElements);
canvas.height = window.innerHeight - (containerElements.length === 0 ? 0 : containerElements[0].clientHeight);

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
  money = defaultMoney;
  days = defaultDays;
  price = defaultPrice;
  minPrice = defaultMinPrice;
  maxPrice = defaultMaxPrice;
  baseChange = defaultBaseChange;
  daysPerSecond = defaultDaysPerSecond;
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

function writeMoney () {
  document.getElementById('currentMoney').innerHTML = Math.round(currentMoney * 100) / 100;
  document.getElementById('stocks').innerHTML = stocks;
}

function writePrice () {
  document.getElementById('currentDay').innerHTML = currentDay;
  document.getElementById('currentPrice').innerHTML = Math.round(currentPrice * 100) / 100;
}
