#!/usr/bin/env bash
set -eo pipefail

case $1 in
  install)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    yarn install | cat
    ;;
  start)
    # The '| cat' is to trick Node that this is an non-TTY terminal
    # then react-scripts won't clear the console.
    yarn start | cat
    ;;
  build)
    yarn build
    ;;
  test)
    yarn test $@
    ;;
  *)
    exec "$@"
    ;;
esac