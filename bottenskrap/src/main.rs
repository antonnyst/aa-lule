use futures::executor::block_on;
use serde_json::Value;

async fn get_page(page: u32) -> Result<Value, http_types::Error>  {
    let req = format!("https://api-extern.systembolaget.se/sb-api-ecommerce/v1/productsearch/search?size=30&storeId=2520&page={}", page.to_string());
    println!("{}",req);
    let mut res = surf::get(req)
    .header("ocp-apim-subscription-key", "x").await?;
    let string = res.body_string().await?;
    Ok(serde_json::from_str(&string).unwrap())
}

fn get_all_pages() {
    let mut i = 300;
    loop {
        let page = block_on(get_page(i)).unwrap();
        println!("{}{}", i, page["metadata"]);
        let next_page = page["metadata"]["nextPage"].as_u64().unwrap();
        for product in page["products"].as_array().unwrap() {
            println!("{}", product["productNameBold"]);
        }
        i += 1;
        if next_page == i as u64{
            break;
        }
    }
}


fn main() {
    println!("Hello, world!");

    get_all_pages()
}
