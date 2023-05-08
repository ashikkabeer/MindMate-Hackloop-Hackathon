const { default: axios } = require("axios");
const { application } = require("express");
var express = require("express");
var router = express.Router();
const { MongoClient } = require('mongodb');
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const connect = require('../config/connection')
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});


const uri = process.env.MONGO_URI
const posts = []
const openai = new OpenAIApi(configuration);
async function ask(prompt) {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a virtual mental health coach" },
        { role: "user", content: "I'm feeling " + prompt },
      ],
    });
    return completion.data.choices[0].message.content;
  } catch (error) {
    console.log(error.response);
  }
}
let data = [];
let data2 = [];
/* GET home page. */
const apiKey =process.env.SPOON_API_KEY
router.get('/signup',(req,res,next)=>{
  res.render('signup')
})
router.get("/", async function (req, res, next) {
  axios
    .get("https://api.nhs.uk/mental-health/conditions/", {
      headers: {
        "subscription-key": process.env.NHS_API,
        Accept: "application/json",
      },
    })
    .then((response) => {
      for (let i = 0; i < response.data.hasPart.length; i++) {
        if (
          response.data.hasPart[i].hasHealthAspect ==
          "http://schema.org/SymptomsHealthAspect"
        ) {
          // console.log(response.data.hasPart[i]);
          data.push(response.data.hasPart[i].description);
          // data2.push(name)
        }
      }
    });
  const options = {
    method: "GET",
    url: "https://quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com/quote",
    params: {
      token: "ipworld.info",
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host":
        "quotes-inspirational-quotes-motivational-quotes.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  console.log(response.data.text);
  const quote = response.data.text;
  res.render("index", { quote, data });
});
router.get("/food", async (req, res, next) => {
  const search = req.query.query;
  console.log(search);
  axios
    .get("https://api.spoonacular.com/recipes/complexSearch", {
      headers: {
        "X-Api-Key": `${apiKey}`,
        "Content-Type": "application/json",
      },
      params: {
        query: search,
        maxFat: 25,
        number: 50,
      },
    })
    .then((response) => {
      const foodItems = response.data.results;
      const nutrients = foodItems[0].nutrition.nutrients;
      res.render("allfood", { foodItems });
    });
});
router.get('/food/details/:id', (req,res,next)=> {
  axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`,{
    headers: {
      'X-Api-Key': `${apiKey}`,
      'Content-Type': 'application/json'
    },
    params: {
      includeNutrition: false
    }
  })
  .then(response => {
    console.log(response.data);
    const recipe = response.data
    const ingredients = response.data.extendedIngredients
    res.render('food',{recipe,ingredients});
})
})
router.get('/forum',(req,res,next)=>{
  res.render('forum')
})
router.post('/forum',(req,res,next)=> {
  const author = req.body.author
  const date = req.body.date
  const content = req.body.content
  posts.push(author, content);
  res.render('forum',{author,date,content})
})
const chatMessages = [];
router.get("/chat", async (req, res, next) => {
  res.render("chat");
});
router.post("/chat", async (req, res, next) => {
  const prompt = req.body.message;
  console.log(prompt);
  const response = await ask(prompt);
  const chatMessage = { message: prompt, isBot: false }; // create a new chat message object for the user message
  const botMessage = { message: response, isBot: true }; //
  chatMessages.push(chatMessage, botMessage); // add the new chat message objects to the existing array
  res.render("chat", { chatMessages });
});


router.post('/signup',async (req,res,next) => {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db('user');
    const collection = db.collection('mycollection');
    await collection.insertOne(req.body);
    console.log('Data inserted successfully');
  } catch (err) {
    console.error('Error while inserting data:', err);
  } finally {
    await client.close();
  }
  console.log(req.body)
})

module.exports = router;
