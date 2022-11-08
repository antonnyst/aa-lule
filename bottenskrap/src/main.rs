use serde_json::Value;
use mongodb::{bson::doc, options::ClientOptions, Client};

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
            save(product).await;
            println!("{}", product);
        }
        if next_page == -1 {
            break;
        }
        i += 1;
    }
}

async fn save(element: &Value) {
    let name = element["productNameBold"].as_str().unwrap();
    let productNumber = element["productNumber"].as_i64().unwrap();
    let price = element["price"].as_i64().unwrap();
    let volume = element["volume"].as_i64().unwrap();
    let percentage = element["alcoholPercentage"].as_i64().unwrap();
    let apk = (percentage / 100) * volume / price;
}

#[tokio::main]
async fn main() -> mongodb::error::Result<()>{
    println!("Hello, world!");
    // Parse your connection string into an options struct
    /*let mut client_options = ClientOptions::parse("mongodb+srv://<username>:<password>@<cluster-url>/test?w=majority")
        .await?;
    
    // Manually set an option
    client_options.app_name = Some("Rust Demo".to_string());
    
    // Get a handle to the cluster
    let client = Client::with_options(client_options)?;
    
    // Ping the server to see if you can connect to the cluster
    client
        .database("admin")
        .run_command(doc! {"ping": 1}, None)
        .await?;
    println!("Connected successfully.");
    
    // List the names of the databases in that cluster
    for db_name in client.list_database_names(None, None).await? {
        println!("{}", db_name);
    }*/

    get_all_pages().await;

    Ok(())
}
