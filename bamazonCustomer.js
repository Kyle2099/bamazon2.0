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

        userStockOptions(result);
    });
}

function wantToExit(choice) {
    if (choice.toLowerCase() === 'b') {
        console.log('BYEEEEE! Thanks for shopping with us.');
        process.exit(0);
    }
}


function userStockOptions(inv) {
    inquirer.prompt([{
        type: 'input',
        name: 'select',
        message: 'What item would you like to purchase?',
        validate: function (sup) {
            return !fog(sup) || sup.toLowerCase() === 'b';
        }
    }
    ])
        .then(function (sup) {
            wantToExit(sup.choice);
            let pickedId = cutNum(sup.choice);
            let stock = invLeft(pickedId, inv);

            if (products) {
                stockQuantity(products);
            }
            else {
                console.log('Sorry please check back later we are out of that item.');
                inventory();
            }
        });
}

function stockQuantity(product) {
    inquirer.prompt([{
        type: 'input',
        name: 'quantity',
        message: 'How many would you like to buy?',
        validate: function (sup) {
            return sup > 0 || sup.toLowerCase() === 'b';
        }
    }
    ])
        .then(function (sup) {
            wantToExit(sup.amount);
            let amount = cutNum(sup.amount);

            if (amount > product.stock_quantity) {
                console.log('Sorry, but we out. Check back next week!')
                inventory();
            }
            else {
                letsBuy(product, amount);
            }
        });
}

function letsBuy(product, amount) {
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
        [amount, product.item_id],
        function (err, result) {
            console.log('Thanks you bought' + amount + ' ' + product.product_name);
        }
    );
}

function reviewStock(pickedID, stock) {
    for (let i = 0; i < stock.length; i++) {
        if (stock[i].itme_id === pickedID) {
            return stock[i];
        }
    }
    return null;
}


