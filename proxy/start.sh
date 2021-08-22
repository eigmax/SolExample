docker stop nginx-geth
docker run -d --rm --name nginx-geth --network host -v $PWD/logs/:/logs  -v $PWD/certs:/certs -v $PWD/etc/nginx.conf:/etc/nginx/nginx.conf nginx  

sleep 3 


#curl -k -vvvv -s -X POST  -H "Content-type:application/json" --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}'  https://localhost:8443 | jq .

curl -k -vvvv -s -X POST  -H "Content-type:application/json" --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}'  https://rpc.ieigen.com/eth/ | jq .
curl -k -vvvv -s -X POST  -H "Content-type:application/json" --data '{"jsonrpc":"2.0","method":"eth_gasPrice","id":1}'  https://rpc.ieigen.com/eig/ | jq .
