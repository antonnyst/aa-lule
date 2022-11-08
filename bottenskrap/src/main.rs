use serde_json::Value;

async fn get_page(page: u32) -> Result<Value, http_types::Error>  {
    let req = format!(
        "https://www.systembolaget.se/api/gateway/productsearch/search/\
        ?size=30\
        &storeId=2520\
        &isInStoreAssortmentSearch=true\
        &page={}", 
        page.to_string()
    );
    println!("{}",req);
    let mut res = surf::get(req)
    .header("baseUrl", "https://api-systembolaget.azure-api.net/sb-api-ecommerce/v1").await?;
    let string = res.body_string().await?;

    Ok(serde_json::from_str(&string).unwrap())
}

async fn get_all_pages() {
    let mut i = 1;
    loop {
        let page = get_page(i).await.unwrap();
        println!("{}{}", i, page["metadata"]);
        let next_page = page["metadata"]["nextPage"].as_i64().unwrap();
        for product in page["products"].as_array().unwrap() {
            println!("{}", product["productNameBold"]);
        }
        if next_page == -1 {
            break;
        }
        i += 1;
    }
}

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    get_all_pages().await
}
