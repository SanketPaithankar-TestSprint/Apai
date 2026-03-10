#!/bin/bash

export NVM_DIR="$HOME/.nvm"
unset npm_config_prefix
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm use 20
npm run dev
