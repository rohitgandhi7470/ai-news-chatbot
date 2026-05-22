

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// NewsAPI key yaha daalo
const NEWS_API_KEY = "YOUR_NEWS_API_KEY";

// Simple memory
let userHistory = {};

// Fetch news function
async function getNews(category = "general", language = "en") {
    try {
        const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=${language}&apiKey=${NEWS_API_KEY}`;

        const response = await axios.get(url);

        return response.data.articles.slice(0, 5);
    } catch (err) {
        console.log(err.message);
        return [];
    }
}

// AI-style summary
function summarize(article) {
    const text = article.description || article.content || "";

    if (!text) return "Summary unavailable.";

    const words = text.split(" ").slice(0, 25).join(" ");

    return words + "...";
}

// Home route
app.get("/", (req, res) => {
    res.json({
        status: "AI News Bot Running"
    });
});

// News route
app.get("/news", async (req, res) => {

    const category = req.query.category || "general";
    const language = req.query.language || "en";
    const userId = req.query.user || "guest";

    const articles = await getNews(category, language);

    const result = articles.map(item => ({
        title: item.title,
        source: item.source.name,
        summary: summarize(item),
        image: item.urlToImage,
        url: item.url
    }));

    userHistory[userId] = {
        lastCategory: category,
        lastLanguage: language
    };

    res.json({
        category,
        language,
        news: result,
        memory: userHistory[userId]
    });
});

// Category list
app.get("/categories", (req,res)=>{
    res.json([
        "general",
        "technology",
        "business",
        "sports",
        "entertainment",
        "health",
        "science"
    ]);
});

app.listen(PORT, ()=>{
    console.log(`Bot running on port ${PORT}`);
});