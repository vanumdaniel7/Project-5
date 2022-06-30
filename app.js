const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
  let workItems = [];
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongocnct = "mongodb+srv://owner:12qwas()@cluster0.wuokrjb.mongodb.net/?retryWrites=true&w=majority"
const previous ="mongodb+srv://admin-saivarma:Sai2000@cluster0.6rnl9.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(mongocnct ,{useNewUrlParser: true, useUnifiedTopology: true});


const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist!!"
});
const item2 = new Item({
  name: "Hit the + buton to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item. "
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
  res.redirect("/Home");
});


app.get("/About",function(req,res){
  res.render("about");
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  const pathon=customListName+"/deleteall";
  console.log(pathon);
  List.findOne({name: customListName}, function(err,foundList) {
    if(!err){
      if (!foundList) {
        //console.log("Does not exists!");
        const list = new List({
          name: customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        //console.log("exists");
        res.render("list",{listTitle: foundList.name,newlistitems: foundList.items, pathon:pathon});
      }
    }
  });

});

app.post("/:ListName/deleteall",function (req,res){
  const name = req.params.ListName;
  List.updateOne({name : name},{items:[]})
  .then((doc)=>{
      res.redirect("/"+name);
  })
  .catch((err)=>{
    console.log(err);
  })
});
app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
   const  item = new Item({
     name: itemName
   });
   if(listName === "Today"){
     item.save();
     res.redirect("/");
   }
    else {
     List.findOne({name:listName},function(err,foundList){
       foundList.items.push(item);
       foundList.save();
       res.redirect("/"+listName);
     });
   }
});


app.post("/delete",function(req,res){
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.findByIdAndRemove(checkeditemid,function(err){
    //console.log("successfully deleted the item");
    res.redirect("/");
   });
 } else {
   List.findOneAndUpdate({name: listName},{$pull: {items: {_id:checkeditemid}}},function(err,foundList){
     if(!err)
     {
       res.redirect("/"+listName);
     }
   })
 }
});

// app.get("/work",function(req,res){
//   res.render("list",{listTitle:"Work List",newlistitems:workItems});
// });
app.post("/work",function(req,res){
     let item= req.body.newItem;
     workItems.push(item);
     res.redirect("/work");
});
app.post("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName)
  res.redirect("/"+customListName);
})
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
  console.log("server started successfully");
});
