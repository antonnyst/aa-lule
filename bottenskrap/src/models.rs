use diesel::prelude::*;
use crate::schema::products;
/*
#[derive(Queryable)]
pub struct Product {
    pub productnumber: i32,
    pub name: &<'a> str,
    pub price: f32,
    pub volume: f32,
    pub percent: f32,
    pub apk: f32
}*/


#[derive(Insertable)]
#[diesel(table_name = products)]
#[derive(Queryable)]
pub struct Product<'a> {
    pub productnumber: &'a i32,
    pub name: &'a str,
    pub category: &'a str,
    pub price: &'a f32,
    pub volume: &'a f32,
    pub percent: &'a f32,
    pub apk: &'a f32
}