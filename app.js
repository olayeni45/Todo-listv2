//jshint esversion:6
const express = require("express");
const mongoose = require('mongoose');
const _ = require('lodash')
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true })

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


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


const defaultDocuments = [food];

//New List Schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema)

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
  const listName = req.body.list;
  const postItem = new Item({
    name: item
  })

  if (listName === "Today") {
    postItem.save();
    res.redirect('/');
  }
  else {

    List.findOne({ name: listName }, (err, docs) => {
      docs.items.push(postItem);
      docs.save();
      res.redirect('/' + listName);
    })

  }

});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    Item.deleteOne({ _id: checkedItemId }, (err) => {
      if (err) {
        console.log(err)
      }
      else {
        console.log("Item deleted");
        res.redirect('/');
      }
    });

  }

  else {
    List.findOneAndUpdate(
      { name: listName },
      {
        $pull:
        {
          items:
            { _id: checkedItemId }
        }
      },
      (err, docs) => {
        if (!err) {
          res.redirect('/' + listName);
        }
      })
  }




})

app.get('/:newRoute', (req, res) => {
  const customListName = _.capitalize(req.params.newRoute);

  List.findOne({ name: customListName }, (err, listItems) => {
    if (err) {
      console.log(err);
    }
    else {

      if (!listItems) {
        //Creating an array of default documents if the path doesn't exist

        const list = new List({
          name: customListName,
          items: defaultDocuments
        })

        list.save();
        res.redirect('/' + customListName);
      }
      else {
        //Show an existing list
        console.log("Found items: ", listItems);
        res.render('list', { listTitle: customListName, newListItems: listItems.items })
      }

    }
  })



})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
