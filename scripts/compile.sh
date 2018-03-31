protoc --ts_out=./ts-out --plugin=./node_modules/.bin/protoc-gen-ts -I protos protos/*.proto

FILENAME1="index.js"
FILENAME2="index.d.ts"

echo "" > ./ts-out/$FILENAME1
echo "" > ./ts-out/$FILENAME2

for d in ts-out/*; do
	FILENAME3=${d#ts-out/}
    if [ "$FILENAME3" != "$FILENAME1" ] && [ "&FILENAME3" != "&FILENAME2" ]; then
		echo $FILENAME3
		if [[ $FILENAME3 == *.ts ]]; then
			echo  "ts file $d"
        	echo "export * from \"./$FILENAME3\"">> ./ts-out/$FILENAME2
		else
			echo "$d" >> ./ts-out/$FILENAME1
		fi
    fi
done