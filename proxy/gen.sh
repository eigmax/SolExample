openssl genrsa -des3 -out ./certs/ca.key 2048
openssl req -x509 -new -nodes -key ./certs/ca.key -sha256 -days 1825 -out ./certs/ca.crt -config ./certs/openssl_ext.conf

openssl genrsa  -out ./certs/server.key
openssl req -new -key ./certs/server.key -out ./certs/server.csr -config ./certs/openssl_ext.conf

openssl x509 -req -extensions server_extensions -extfile ./certs/openssl_ext.conf -in ./certs/server.csr -CA ./certs/ca.crt -CAkey ./certs/ca.key -CAcreateserial -out ./certs/server.crt -days 3650


openssl genrsa  -out ./certs/client.key
openssl req -new -key ./certs/client.key -out ./certs/client.csr -config ./certs/openssl_ext.conf

openssl x509 -req -extensions client_extensions -extfile ./certs/openssl_ext.conf -in ./certs/client.csr -CA ./certs/ca.crt -CAkey ./certs/ca.key -CAcreateserial -out ./certs/client.crt -days 3650


