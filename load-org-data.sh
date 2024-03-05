#!/usr/bin/env bash

: "${FIXTURES_SOURCE:=https://github.com/coronasafe/leaderboard-data.git}"

if [ -d "data-repo/.git" ] && (cd data-repo && git remote -v | grep -q 'upstream'); then
  echo "Updating existing data repository..."
  
  cd data-repo
  
  git fetch upstream
  git checkout --force main
  git reset --hard main
  
  cd ..
else
  echo "Cloning data repository for the first time..."
  
  rm -rf data-repo
  git clone ${FIXTURES_SOURCE} data-repo
  cd data-repo
  
  git remote add upstream ${FIXTURES_SOURCE}
  git remote remove origin 
  
  git pull upstream main
  cd ..
fi

