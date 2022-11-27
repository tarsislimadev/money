for i in `ls src/`; do
cd  "src/$i"
git push origin --all
cd ..
done
