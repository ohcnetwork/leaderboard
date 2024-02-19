: "${FIXTURES_SOURCE:=https://github.com/coronasafe/leaderboard-data.git}"

rm -rf data-repo
mkdir data-repo
cd data-repo

git init
git remote add --mirror=fetch origin ${FIXTURES_SOURCE}
git config core.sparseCheckout true

echo "data/" >> .git/info/sparse-checkout
echo "contributors/" >> .git/info/sparse-checkout

git pull origin main