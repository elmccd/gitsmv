# gitsmv [![Build Status](https://travis-ci.org/elmccd/gitsmv.svg?branch=master)](https://travis-ci.org/elmccd/gitsmv)

> Show dashboard listing statuses of all git submodules


## Install

```
$ npm install --save gitsmv
```

## CLI

```
$ npm install --global gitsmv
```

```
$ gitsmv --help

  Usage
    gitsmv [input]

  Options
    --fetch  Fetch upstream branches [Default: false]
    --debug  Display executed commands [Default: false]
    --match regexp  Filter entries by paths [Default: all]
    --track branch  Extra branches to track  nr of commits between them and HEAD [Default: none]
    --no-color  Disable colors

  Examples
    $ gitsmvs
    $ gitsmv --help
    $ gitsmv --debug
    $ gitsmv --fetch
    $ gitsmv --fetch --match 'submod*'
    $ gitsmv --fetch --track develop --track master
```


## License

MIT © [Maciej Dudzinski](https://github.com/elmccd)
