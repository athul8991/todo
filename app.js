//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const _ = require('lodash');

mongoose.set('strictQuery',true)
mongoose.connect('mongodb+srv://athuls8991:tlHFPOJBAVvNb6A5@cluster0.ityc9mx.mongodb.net/todolistDb',{useNewUrlParser:true},()=>{
  console.log("Connected");
})
const newItemSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  }
  
});

const Item = mongoose.model("Item",newItemSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1 = new Item({
  name:"Buy Food"
})

const item2 =new Item({
  name:"Coock Food"
})

const item3 =new Item({
  name:"Eat Food"
})

const listSchema = mongoose.Schema({
  name:String,
  item:[newItemSchema]
});

const itemArray = [item1,item2,item3]
const List = mongoose.model("List",listSchema);






app.get("/", function(req, res) {

  // Show database start

  Item.find({},(err,result)=>{
    if(err){
      console.log("Error : "+err);
    }else{
      
      // const day = date.getDate();
      const day = "Today"
      if(result.length ===0){
        Item.insertMany(itemArray,(err)=>{
          if(err){
            console.log("Error : "+err);
          }else{
            console.log("Saved Succesfully");
          }
        })

        res.redirect("/")
      }else{
        
        res.render("list", {listTitle: day, newListItems: result});

      }

       

    }
  })

  //end



});

app.post("/", function(req, res){


  const item = req.body.newItem;
  const listName = req.body.listName;


  const addItem = new Item({
    name:item
})

if(listName === 'Today'){
  addItem.save(()=>{
    res.redirect("/")
  })
}else{
  List.findOne({name:listName},(err,foundList)=>{
    if(!err){
      foundList.item.push(addItem);
      foundList.save(()=>{
        res.redirect("/"+listName)
      });
      

    } 
  })
}

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


//delet
app.post("/del",function(req,res){
  
  let delId = req.body.checkItem;
  const delListname = req.body.listName;
if(delListname === "Today"){
  Item.findByIdAndDelete(delId,(err)=>{

    if(!err){
    console.log("Deleted");
    res.redirect("/")
    }else{
      console.log("error Deleting : "+err);
    }

  })
}else{

  List.findOneAndUpdate({name:delListname},{$pull:{item :{_id:delId}}},(err,result)=>{
    if(!err){
      res.redirect("/"+delListname);
    }else{
      console.log("Error : "+err);
    }
  })

}


})

//dynamic route

app.get("/:itemClass",(req,res)=>{
  const customList = _.capitalize(req.params.itemClass);

  // check already exist

  List.findOne({name:customList},(err,result)=>{
    if(!err){
      if(!result){
        console.log(result);

        const list = new List({

          name:customList,
          item: itemArray
          })
            
          list.save(()=>{
            res.redirect("/"+customList);
          });
          
      }else{
        res.render("list",{listTitle: result.name, newListItems: result.item})
      }
    }
  })
//   List.find({},(err,result)=>{
//     if(err){
//       console.log("Error : "+err);
//     }else{
//      let flag = false;
//       result.forEach((data)=>{
//         if(data.name === customList){
//          flag = false;
  
//       }else{
//       flag =true;
      
//     }

//       })
//       if(flag){
//       

//       }else{
//         console.log("\n\nList allready Exists");
//       }
 
//   }

// })
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
