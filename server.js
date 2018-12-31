const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const request = require('request');
const apiKey = 'AIzaSyD7TH2n15QFbJFw76CeAcJ1vbLeMGzcCFA';
const rp = require('request-promise');
const weekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const argv = require('yargs').argv;

function getDOW(){
var d = new Date();
var n = d.getDay();
if(n == 0)
{
  n = 7;
}
var day = weekday[n-1];
return n-1;
};

function getHOD(){
var d = new Date();
var h = d.getHours();
return h;
};


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  // NEW CODE
      res.render('index', {poptime: null, name: null, error: null});

})

app.post('/', function (req, res) {
  let city = req.body.city;
  let place = req.body.placeName;

  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${place}%20${city}&inputtype=textquery&fields=place_id&key=${apiKey}`
  
request(url, function (err, response, body) {
    if(err){
      console.log('err');
      res.render('index', {poptime: null, name: null, error: 'Error, please try again'});
    } else {

      let placeValue = JSON.parse(body)

      if(placeValue.status == undefined){
        res.render('index', {poptime: null, name: null, error: 'Error, please try again'});
      } else {
        let placeID =  placeValue.candidates[0].place_id;

        if(!placeID)
        {
          res.render('index', {poptime: null, name: null, error: 'Error, please try again'});
        }
        let poptimeurl='http://popular-times.herokuapp.com/GetPopTimes/'+ placeID;



        request(poptimeurl, function (err, response, body) {
          if(err)
          {
            console.log('error in poptime URL');
            res.render('index', {poptime: null, name: null, error: 'Error, please try again'});
          }
          else{

            let popTimes = JSON.parse(body)


            if(placeValue.status == undefined){
              console.log('error');
              res.render('index', {poptime: null, name: null, error: 'Error, please try again'});
            } else {
              let placeValue = JSON.parse(body)
              let day = getDOW();
              let hour = getHOD();
              let name = popTimes.name;

              let times = popTimes.populartimes;


              var poptimetoday = times[day];
              

              var waittimetoday = poptimetoday.data[hour];
              console.log(waittimetoday);
             
              res.render('index', {poptime: waittimetoday, name: name, error: null});
            }
          }
        });
      }
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


