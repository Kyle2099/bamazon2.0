const mysql = require('mysql');
const inquirer = require("inquirer");
require("dotenv").config();


let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.password,
    database: 'bamazondb2',
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
});

connection.connect(function (err) {
    if (err) {
        console.log('error connecting to products');
    }
    inventory();
});

function inventory() {
    connection.query('SELECT * FROM products', function (err, result) {
        if (err) throw err;
        console.log(result);

        let choiceArray = [];

        for(let i = 0; i < result.length; i++){
            choiceArray.push(result[i].product_name);
        }

        userStockOptions(choiceArray);
    });
}




function userStockOptions(inv) {
    inquirer.prompt([{
        type: 'list',
        name: 'productItem',
        choices: inv,
        message: 'What item would you like to purchase?',
    
    }
  
    ])
        .then(function (sup) {

            console.log("This is supply from inquier: ", sup);

            stockQuantity(sup.productItem);
           
        });
}

function stockQuantity(productItem) {
    inquirer.prompt([{
        type: 'input',
        name: 'quantity',
        message: 'How many would you like to buy?'
        
    }
    ])
        .then(function (sup) {

            // console.log("This is our quantity inquerer response: ", sup);

            if(Number.isInteger(parseInt(sup.quantity))){

                let productQuantity = Number.parseInt(sup.quantity);
                // console.log("We have a whole number, the use wants to buy this many: ", productQuantity);

                checkAvailability(productItem, sup.quantity )
            }else{
                console.log("Please select a valid whole number to make a purchase");
            }


    
        });
}

function checkAvailability(productItem, productQuantity){
    // console.log("This is the product Item: ", productItem);
    // console.log("This is the productQuanity: ", productQuantity);

    connection.query('SELECT stock_quantity, price FROM products WHERE product_name=?', [productItem], function(error, dbResults, fields){

        if(error) throw error;


        console.log(dbResults)

        let availableInventory = dbResults[0].stock_quantity;
        let itemPrice = dbResults[0].price;
        let totalSale = itemPrice * productQuantity;

        if((availableInventory - productQuantity) > 0){
            if(productQuantity > 1){
                console.log(`You just purchases ${productQuantity} ${productItem}s for ${totalSale}`)
            }
            else{
                 console.log(`You just purchases ${productQuantity} ${productItem} for ${totalSale}`)
            }

            updateDatabase(productItem, availableInventory - productQuantity);
        }
    })


}

function updateDatabase(productItem, updatedQuantity){
    connection.query("UPDATE products SET ? WHERE ?", [
        {
            stock_quantity: updatedQuantity
        },
        {
            product_name: productItem
        }
    ], function(error, results, fields){
        if(error) throw error;

        inventory();
    })
}




