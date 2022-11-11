use models::{Product};
use serde_json::Value;
use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
pub mod models;
pub mod schema;

async fn get_page(page: u32) -> Result<Value, http_types::Error>  {
    let req = format!(
        "https://www.systembolaget.se/api/gateway/productsearch/search/\
        ?size=30\
        &isInStoreAssortmentSearch=true\
        &page={}", 
        page.to_string()
    ); 
    //&storeId=2520\
    let mut res = surf::get(req)
    .header("baseUrl", "https://api-systembolaget.azure-api.net/sb-api-ecommerce/v1").await?;
    let string = res.body_string().await?;

    Ok(serde_json::from_str(&string).unwrap())
}

async fn get_all_pages(connection: &mut PgConnection) {
    use crate::schema::products;

    diesel::delete(products::table)
        .execute(connection)
        .expect("Error clearing table");

    let mut i = 1;
    loop {
        let page = get_page(i).await.unwrap();
        println!("Got page {}", i);
        let next_page = page["metadata"]["nextPage"].as_i64().unwrap();
        for product in page["products"].as_array().unwrap() {
            save(product, connection).await;
        }
        if next_page == -1 || next_page == i as i64 {
            break;
        }
        i += 1;
    }
}

async fn save(element: &Value, connection: &mut PgConnection) {
    let productnumber: &i32 = &element["productNumber"].as_str().unwrap().parse().unwrap();
    let name = &element["productNameBold"].as_str().unwrap().to_string();
    let category = &element["customCategoryTitle"].as_str().unwrap().to_string();
    let price: &f32 = &(element["price"].as_f64().unwrap() as f32);
    let volume: &f32 = &(element["volume"].as_f64().unwrap() as f32);
    let percent: &f32 = &(element["alcoholPercentage"].as_f64().unwrap() as f32);
    let apk = &((percent / 100.0) * volume / price);

    let new_product = Product {
        productnumber,
        name,
        category,
        price,
        volume,
        percent,
        apk
    };

    use crate::schema::products;

    diesel::insert_into(products::table)
        .values(&new_product)
        .execute(connection)
        .expect("Error saving new post");
}


#[tokio::main]
async fn main() {
    println!("Hello, world!");
    
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let mut connection = PgConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to {}", database_url));

    get_all_pages(&mut connection).await;

}
