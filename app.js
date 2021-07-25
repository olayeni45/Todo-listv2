//jshint esversion:6
const express = require("express");
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const workItems = [];

//Schema, Model, Default documents
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})
const Item = mongoose.model("Item", itemSchema)

const food = new Item({
  name: "Buy Suya"
})

const cloth = new Item({
  name: "Return Clothes"
})

const grocery = new Item({
  name: "Buy groceries from Shoprite"
})

const defaultDocuments = [food, cloth, grocery];

//Routes
app.get("/", function (req, res) {

  Item.find({}, (err, listItems) => {

    if (listItems.length === 0) {

      Item.insertMany(defaultDocuments, (err) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Inserted three documents")
        }
      })

      res.redirect('/');

    }
    else {
      res.render("list", { listTitle: "Today", newListItems: listItems });
    }


  })


});

app.post("/", function (req, res) {

  const item = req.body.newItem;

  const postItem = new Item({
    name: item
  })

  postItem.save();

  res.redirect('/');

});

app.post('/delete', (req, res) => {
  console.log(req.body);
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
