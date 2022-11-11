-- Your SQL goes here
CREATE TABLE products (
    id SERIAL PRIMARY KEY NOT NULL,
    productNumber int NOT NULL,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    price REAL NOT NULL,
    volume REAL NOT NULL,
    percent REAL NOT NULL,
    apk REAL NOT NULL
)