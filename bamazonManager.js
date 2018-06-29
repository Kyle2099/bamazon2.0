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


function loadBossMenu() {
    connection.query('SELECT * FROM products', function (err, result) {
        if (err) throw err;

        loadOptions(result);
    });
}

function loadOptions(products) {
    inquirer.prompt({
        type: 'list',
        name: 'choice',
        choices: ['See items for sale', 'Low items', 'Add to existing items', 'Add new item', 'Or you can Quit'],
        message: 'What will it be today?'
    })
        .then(function (sup) {
            switch (sup.choice) {
                case "See items for sale":
                    console.table(products);
                    loadBossMenu();
                    break;
                case 'Low items':
                    loadLowItems();
                    break;
                case 'Add to existing items':
                    addToExistingItems(products)
                    break;
                case "Add new item":
                    BossNewItem(products);
                    break;
                default:
                    console.log('BYEEEEEEE!');
                    process.exit(0);
                    break;

            }
        });
}

function loadLowItems() {
    conection.query('SELECT * FROM products WHERE stock_quanity <= 10', function (err, result) {
        if (err) throw err;
        console.table(result);
        loadBossMenu();
    });
}


function bossForHowMany(products) {
    inquirer.prompt([{
        type: 'input',
        name: 'quantity',
        message: 'How many would you like to buy?',
        validate: function (sup) {
            return sup > 0;
        }
    }
    ])
        .then(function (sup) {
            let amount = cutNum(sup.amount);
            addItem(product, quantity);
        });
}

function addItem(product, quantity) {
    connection.query(
        'UPDATE products SET stock_quantity = ? WHERE item_id = ?',
        [product.stock_quantity + quantity, product.item_id],
        function(err, res) {
        console.log('You have added' + quantity + ' ' + product.product_name);
        loadBossMenu();
        }
    );
}

function BossNewItem(product) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'item_name',
            message: 'Please add in the name of the item you would like to add.'
        },
        {
            type: 'list',
            name: 'department_name',
            choices: addedCatagories(product),
            message: 'Which Catag. does this item belong to.'
        },
        {
            type: 'input',
            name: 'cost',
            message: 'How much does this item cost?',
            validate: function (sup) {
                return sup > 0;
            }
        },
        {
            type: 'input',
            name: 'amount',
            message: 'How many are going into the store?',
            validate: function (sup) {
                return !fog(sup);
            }
        }
    ])
        .then(addNewItem)
}

function addNewItem(sup) {
    connection.query(
        'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)',
        [sup.product_name, sup.department_name, sup.price, sup.quantity],
        function (err, result) {
            if (err) throw err;
            console.log(sup.product_name + 'We got your new items added.');
            loadBossMenu();
        }
    );
}

function addedCatagories(product) {
    let departments = [];
    for (let i = 0; i < product.length; i++) {
        if (departments.indexOf(product[i].department_name) === -1) {
            departments.push(product[i].department_name);
        }
    }
    return departments;
}

function reviewStock(pickedID, stock) {
    for (let i = 0; i < stock.length; i++) {
        if (stock[i].itme_id === pickedID) {
            return stock[i];
        }
    }
}