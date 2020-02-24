const express = require("express");
const app = express();
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

mongoose.connect("mongodb+srv://smart-shop-admin:password1234@smart-shop-db-drot2.mongodb.net/smart-shop-db?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const { productSchema } = require('./schema/product');
const { userSchema } = require('./schema/user');
const { cartSchema } = require('./schema/cart');
const { orderSchema } = require('./schema/order');
const product = mongoose.model("product", productSchema);
const user = mongoose.model("user", userSchema);
const cart = mongoose.model("cart", cartSchema);
const order = mongoose.model("order", orderSchema);

//////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
    res.send("IT'S WORKING!! BACKEND WITH FRONTEND");
});

////////////////////////////////////////////////////////////////
//PRODUCTS URL

app.get("/allProducts", (req, res) => {
    product.find({}, (err, pr) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: pr });
        }
    });
});


app.post("/addProduct", (req, res) => {
    const body = (req.body);
    // console.log(body);
    let name = body["name"].toLowerCase();
    let price = body["price"];
    let brand = body["brand"].toLowerCase();
    let type = body["type"].toLowerCase();
    let category = body["category"].toLowerCase();
    let image = body["imageUrl"];
    let count = body["count"];
    let description = body["description"];
    let pr = { name: name, price: price, brand: brand, type: type, category: category, count: count, image: image, description: description };
    product.create(pr, (err, newly) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({ data: newly });
        }
    })
});


app.get("/types", (req, res) => {
    product.distinct("type", (err, pr) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: pr });
        }
    });
});


app.get("/:type/category", (req, res) => {

    let type = req.params.type.toLowerCase();
    product.distinct("category", { type: type }, (err, pr) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: pr });
        }
    });

});


app.get("/:type/:category/brands", (req, res) => {

    let type = req.params.type.toLowerCase();
    let category = req.params.category.toLowerCase();
    product.distinct("brand", { type: type, category: category }, (err, pr) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: pr });
        }
    });

});


app.get("/:type/:category/:brand/products", (req, res) => {

    let type = req.params.type.toLowerCase();
    let category = req.params.category.toLowerCase();
    let brand = req.params.brand.toLowerCase();

    product.find({ type: type, category: category, brand: brand }, (err, pr) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: pr });
        }
    });

});

/////////////////////////////////////////////////////////////////////////////
//USER ROUTES

app.post("/user", (req, res) => {
    let userid = req.body.userId;
    user.find({ userid: userid }, (err, user) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            res.status(200).json({ data: user });
        }
    });
});

app.get("/user", (req, res) => {
    user.find({}, (err, user) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            // res.send("it worked");
            res.status(200).json({ data: user });
        }
    });
});
app.post("/createUser", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let userid = req.body.userId;
    let profilePicUrl = req.body.profilePicUrl;

    let ur = { name: name, email: email, userid: userid, profilePicUrl: profilePicUrl };
    user.create(ur, (err, newly) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err });
        } else {
            res.status(200).json({ data: newly });
        }
    })
});

///////////////////////////////////////////////////////////
//CART ROUTES

app.post("/addtocart/:userid", (req, res) => {
    let userid = req.params.userid;
    let productRef = req.body.productRef;
    let count = req.body.count;
    let cr = { productRef: productRef, count: count };
    user.find({ userid: userid }, (err, us) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: err });
        } else {
            // const userCart = [us.cart];
            us[0].cart.push(cr);
            console.log(us[0].cart);
            us.save();
            res.status(200).json({ data: us });
        }
    });
    // cart.create(cr, (err, newly) => {
    //     if (err) {
    //         console.log(err);
    //         res.status(500).json({ error: err });
    //     } else {
    //         res.status(200).json({ data: newly });
    //     }
    // });
});
app.get("/cart/:userid", (req, res) => {
    cart.find({ userid: req.params.userid }, (err, item) => {
        if (err) {
            res.status(500).json({ error: err })
            console.log(err);
        } else {
            let a = [];
            for (i = 0; i < item.length; i++) {
                product.findById(item[i].productRef, (err, pr) => {
                    if (err) {
                        res.status(500).json({ error: err })
                        console.log(err);
                    } else {
                        let b = { "prod": pr, "count": item[i].count };
                        // b.push(pr);
                        // b.push(item[i].count);
                        a.insert(b);
                    }
                });
            }
            res.status(200).json({ data: item });
        }
    });
});




/////////////////////////////////////////////////////////////////////
//CONNECTING ROUTES

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server started at ${port}`);
});