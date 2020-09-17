# Architecture

1. input enter
2. add command to history
3. invoke stuff that has side effects (only should run once) (ex: cd, execute command)
4. render command item
5. invoke neccessary functions for dev
6. input
7. enter {id, input, currentDir}
8. resolve command (decide whether go default/custom route)

## Default (event based)

4. render default component
5. send event
6. generate result in backend
7. send back {id, result}
8. listen for event in Item w/ correct id
9. render result correctly

## Custom (custom react resolver (might call commands))

- `ls` (but not `ls --json`, `ls -p`)
- `go`
- `edit`
- plugins?

4. render custom component (for example `ls`)
5. call neccessary functions (interact w/ backend using the promisified function)
6. get result
7. send back {id, result}
8. listen for event in Item w/ correct id
9. render result correctly
