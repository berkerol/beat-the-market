# Beat the Market

[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=berkerol_beat-the-market&metric=alert_status)](https://sonarcloud.io/dashboard?id=berkerol_beat-the-market)
[![CI](https://github.com/berkerol/beat-the-market/actions/workflows/lint.yml/badge.svg?branch=master)](https://github.com/berkerol/beat-the-market/actions/workflows/lint.yml)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/berkerol/beat-the-market/issues)
[![semistandard](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/Flet/semistandard)
[![ECMAScript](https://img.shields.io/badge/ECMAScript-latest-brightgreen.svg)](https://www.ecma-international.org/ecma-262)
[![license](https://img.shields.io/badge/license-GNU%20GPL%20v3.0-blue.svg)](https://github.com/berkerol/beat-the-market/blob/master/LICENSE)

Buy low, sell high, make money. Stock charts are generated randomly. Generation method is based on [Random walk hypothesis](https://en.wikipedia.org/wiki/Random_walk_hypothesis) and influenced by [Geometric Brownian motion](https://en.wikipedia.org/wiki/Geometric_Brownian_motion): on top of random change, it uses random up/down trend and volatility that change with random periods. Click button to change settings to fit the chart for a specific stock. Press _R_ to reset settings to defaults. Hover over the chart to see price and change on that day. Made with [Chart.js](https://www.chartjs.org).

[![button](play.png)](https://berkerol.github.io/beat-the-market/btm.html)

## Continous Integration

It is setup using GitHub Actions in `.github/workflows/lint.yml`

## Contribution

Feel free to [contribute](https://github.com/berkerol/beat-the-market/issues) according to the [semistandard rules](https://github.com/Flet/semistandard) and [latest ECMAScript Specification](https://www.ecma-international.org/ecma-262).

## Distribution

You can distribute this software freely under [GNU GPL v3.0](https://github.com/berkerol/beat-the-market/blob/master/LICENSE).
