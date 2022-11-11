// @generated automatically by Diesel CLI.

diesel::table! {
    products (id) {
        id -> Int4,
        productnumber -> Int4,
        name -> Varchar,
        category -> Varchar,
        price -> Float4,
        volume -> Float4,
        percent -> Float4,
        apk -> Float4,
    }
}
