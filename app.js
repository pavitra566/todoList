//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-pavitra:askomaite123@cluster0.mmeao.mongodb.net/todolistDB",{ useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item",itemsSchema);


const item1 = new Item({
  name: "Study"
});

const defaultArr = [item1];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find({},function(err,items){

      if(items.length ==0){
        Item.insertMany(defaultArr,function(err){
          if(err)
            console.log(err);
          else {
            console.log("Successfully Inserted Items");
          }
        });
        res.redirect("/");
      }
      else{
      res.render("list", {
        listTitle: day,
        newListItems: items});
      }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem  = new Item({
    name: itemName
  })

  const day = date.getDate();
  if(listName === day){
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.list123;

  console.log(listName);
    const day = date.getDate();
    if(listName === day){
    Item.findByIdAndRemove(checkedItemID,function(err){
        if(err)
          console.log(err);
        else
          console.log("Successfully deleted checked Item");
          res.redirect("/");
    })
  }
  else {
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemID} }}, function(err,foundList){
      if(!err)
        res.redirect("/"+listName);
    })
  }


});

app.get("/:customlist",function(req,res){
  const customList = _.capitalize(req.params.customlist);
  List.findOne({name: customList}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customList,
          items: defaultArr
        });

        list.save();
        res.redirect("/"+customList);

    }else{
        res.render("list",{
          listTitle: foundList.name,
          newListItems: foundList.items})
    };
  }})
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
