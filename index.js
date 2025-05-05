import express from "express";
import {fileURLToPath} from "url";
import path from "path";
import nodemailer from "nodemailer";

let app = express();

let port = 3000;

//construct path to html file
let __fileName = fileURLToPath(import.meta.url);
console.log({__fileName});

let __dirName = path.dirname(__fileName);
console.log({__dirName});

//set up templating
app.set('views', './views');
app.set('view engine', 'pug');

//middleware for accessing request body
app.use(express.urlencoded({extended: true}));

//static items
app.use(express.static("public"));


//routing list of breweries
app.get('/breweries', async(req, res) => {
    //Criteria by which to search
    let query = req.query;
    let city = query.by_city;

    console.log({city});
    // res.sendFile(path.join(__dirName, "public", "movie.html"));
    let breweryData;
    //filter by city
    if (city) {
        let breweries = await fetch(`https://api.openbrewerydb.org/v1/breweries?by_city=${city}`);
        breweryData = await breweries.json();

        //handle city not found
        if (breweryData.length === 0) {
            //return res.status(400).json({error: "City not found"});
            return res.render("error", {message: 'City not found'});
        };

    } else {
        let breweries = await fetch("https://api.openbrewerydb.org/v1/breweries");
        breweryData = await breweries.json();
    }
    
    // console.log({breweryData});
    res.render("breweries", { data: breweryData });
    //res.json(breweryData);

    //res.send(breweryData);
});

//route single breweries
app.get('/breweries/:id', async(req, res) => {
    let id = req.params.id;
    // res.sendFile(path.join(__dirName, "public", "movie.html"));
    let breweries = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);
    let breweryData = await breweries.json();
    console.log({breweryData});
    console.log({id});
    res.render("brewery", { data: breweryData });
    //res.json(breweryData);

    //res.send(breweryData);
});

//contact page route
app.get("/contact", (req, res) => {
    res.sendFile(path.join(__dirName, "public", "contact.html"))
});

app.post('/contact', (req, res) => {
    //get the values submitted from the form
    let body = req.body;
    let name = body.name;
    let email = body.email;
    let occupation = body.occupation;
    

    console.log({name, email, occupation});

    let transporter = nodemailer.createTransport({
        //service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user:'denniskarikiu@gmail.com',
            pass: 'flli tpjd vgom ynca'
        }
    });

    transporter.sendMail({
        from: 'denniskarikiu@gmail.com',
        to: 'dennisgitau83@gmail.com',
        subject: 'Test email',
        text: 'Hello, this is my first email via nodemailer... hooorayyy!!'
    }, (info, error) => {
        if (error) {
            console.log(error)
        } else {
            console.log(`Email sent to ${info.response}`)
        }
    });
    //success text once submitted
    res.send('Submitted successfully');

    //the go-to page once form is submitted
    //res.redirect("/");
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`)
});