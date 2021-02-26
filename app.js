//requiring all modules

const express = require('express');
const bodyParser = require("body-parser");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")


//app creation using express
const app = express();

//body parser and static files uses
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

//connecting to server
mongoose.connect("mongodb+srv://jay_thummar:JAY24jay24@@cluster0.htws5.mongodb.net/todolistDB?retryWrites=true&w=majority" , {useNewUrlParser: true, useUnifiedTopology: true});

//creation of schema for items
const itemsSchema = mongoose.Schema({
  name:String
});

const Item = new mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name:"Welcome to your to-do-list!"
});

const item2 = new Item({
  name:"hit '+' to add new tasks to your list. "
});

const item3 = new Item({
  name:"<-- hit this to delete the item."
});

const defaultItems = [ item1 , item2 , item3];

//adding schema for new lists or coustom url

const listSchema = {
  name : String,
  items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);


//get requests

app.get("/" , function(req , res){

  //const day = date.getDate()
  Item.find({} , function(err , foundItems){
    if(foundItems.length === 0){

      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        } else {
          console.log("default items added successfuly!!!")
        }
      });
      res.redirect("/")
      
    } else {

      res.render("lists" , {
        listTitle : "Today" ,
        newItems : foundItems
      });

    }
  });

});


app.get("/:customListName" , function(req ,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName} , function(err , foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        res.render("lists" , {listTitle : foundList.name , newItems : foundList.items});
      }
    };
  });

})


//post requests

app.post("/" , function(req , res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });


  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete" , function(req ,res){

  const checkedItem = req.body.checkedbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem , function(err){
      if(!err){
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName} , { $pull : {items: {_id : checkedItem}}} , function(err , foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

//listening to a particular port

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port , function(){
  console.log("server is running on port 3000.")
});
