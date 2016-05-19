# gitsmv [![Build Status](https://travis-ci.org/elmccd/gitsmv.svg?branch=master)](https://travis-ci.org/elmccd/gitsmv)

> Show dashboard listing statuses of all git submodules

## CLI

```
$ npm install --global gitsmv

$ gitsmv --fetch

      myProject  | develop         | 1↑ | 3↓ | ✘ | 4ae3987 | 5 days ago     | Tom  Smith | Add new fancy icons
      submodule  | master          | 1↑ | −  | ✔ | 98500d4 | 3 days ago     | Tom  Smith | Fix something
      submodule2 | feature/TASK-34 |    |    | ✔ | e84de52 | 5 days ago     | Tom  Smith | Update package.json
```

```
$ gitsmv --help

    Usage,
      $ gitsmv [input],

    Columns,
      1. Repository path base name
      2. Active branch
      3. Number of commits in HEAD that are missing (not yet pushed) in remote
      4. Number of commits in remote branch missing in HEAD
      5. Is working directory clean (ignoring untracked files)
      .. Custom tracked branches goes here. See --track
      6. Last commit hash
      7. Last commit date
      8. Last commit author
      9. Last commit message

    Options,
      --fetch         Fetch upstream branches [Default: false].

                      Run git fetch for all current branches remote. If there is no
                      default upstream set origin/[currentBranch] is being fetched

      --match=regexp  Filter entries by paths [Default: all],

                      Match entire path to repository/submodule to provided
                      regular expression.
                      Root repository is always included

      --track=branch  Extra branches to track. [Default: none]
                      Displays number of commits in origin/[branch] but not in HEAD

                      Specify additional branches that will be listed after status column.
                      Displayed value represent number of commits in tracked branch that
                      are not included in actual HEAD
                      Might contain multiple branches "gitsmv --track dev --track master"

      --debug         Display executed commands [Default: false],
      --no-color      Disable colors,
      --help          Show this instruction
```


## License

MIT © [Maciej Dudzinski](https://github.com/elmccd)
