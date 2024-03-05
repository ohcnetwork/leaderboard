: "${FIXTURES_SOURCE:=https://github.com/coronasafe/leaderboard-data.git}"

if [ -d "data-repo/.git" ]; then
  echo "Updating existing data repository..."
  
  cd data-repo
  
  git fetch upstream
  git checkout --force main
  git reset --hard main
  
  cd ..
else
  echo "Cloning data repository for the first time..."

  rm -rf data-repo
  mkdir data-repo
  cd data-repo
  
  git init
  git remote add --mirror=fetch upstream ${FIXTURES_SOURCE}
  git config core.sparseCheckout true
  
  echo "data/" >> .git/info/sparse-checkout
  echo "contributors/" >> .git/info/sparse-checkout
  echo "config/" >> .git/info/sparse-checkout
  
  git pull upstream main
  cd ..
fi

