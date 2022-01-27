//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date = require(__dirname + "/date.js");
const config=require(__dirname + "/config.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const admin=config.admin();
const pass=config.pass();
mongoose.connect("mongodb+srv://"+admin+":"+pass+"@cluster0.xziyn.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
};

const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"Welcome to the ToDo List"
});

const item2=new Item({
  name:"Hit + to add item"
});

const item3=new Item({
  name:"<-- to delete the item"
});

const defaultArray=[item1,item2,item3];



const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("list",listSchema);


app.get("/", function(req, res) {

Item.find(function(err,items){
  if(items.length==0){
    Item.insertMany(defaultArray,function(err){
    if(err)
      console.log(err);
    else
      console.log("Successfully inserted the items");
    })
    res.redirect("/");
  }
  else
    res.render("list", {listTitle: "TodoList", newListItems: items});
});
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item=new Item({
    name:itemName
  });

  if(listName=="TodoList"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save(function(err){
        if(!err){
          console.log("List is saved");
          res.redirect("/list/"+listName);
        }
      });
      
    });
  }



  
  
});


app.get("/list/:listName",function(req,res){
  const listName=_.capitalize(req.params.listName);

  List.findOne({name:listName},function(err,result){
    if(!err){
      if(!result){
        const list=new List({
          name:listName,
          items:defaultArray
        });
        list.save();
        res.redirect("/list/"+listName);
      }
      else{
        res.render("list",{listTitle: listName, newListItems: result.items});
      }
    }
  });
});


app.post("/delete",function(req,res){
  const del=req.body.checkbox;
  const listName=req.body.listName;
  
  if(listName=="TodoList"){
    Item.findByIdAndRemove(del,function(err){
      if(!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:del}}},function(err,foundLists){
      if(!err){
        res.redirect("/list/"+listName);
      }
    });
  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
