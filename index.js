import cheerio from "cheerio"
import request from "request";
import OpenWeatherAPI from "openweather-api-node"
import 'dotenv/config'

import CyclicDb from "@cyclic.sh/dynamodb"
const db = CyclicDb("good-puce-capybara-yokeCyclicDB")
const data = db.collection("data")

// const { clientId, guildId, token, publicKey } = require('./config.json');
const APPLICATION_ID = process.env.APPLICATION_ID 
const TOKEN = process.env.TOKEN 
const PUBLIC_KEY = process.env.PUBLIC_KEY || 'not set'
const GUILD_ID = process.env.GUILD_ID 

import axios from 'axios'
import express from 'express';
import dcclient from 'discord-interactions';
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = dcclient;


const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Authorization",
  "Authorization": `Bot ${TOKEN}`
  }
});

let weather = new OpenWeatherAPI({
    key: process.env['OPENWEATHER'],
    units: "metric"
})

const wingp = 'https://theigpchampionsleague.com/wings';
const infop = 'https://theigpchampionsleague.com/race-preview';
const wings = [];
const info = [];

const circuits = {
    'abu dhabi': ['Yas Marina Circuit', '<https://openweathermap.org/city/8057179>', 24.469656520027602, 54.60537410845018],
    australia: ['Albert Park Circuit', '<https://openweathermap.org/city/8029812>', -37.85030628530806, 144.9703277613587],
    austria: ['Red Bull Ring', '<https://openweathermap.org/city/7872394>', 47.21977038781961, 14.765467148398473],
    azerbaijan: ['Baku', '<https://openweathermap.org/city/586854>', 40.37303250322397, 49.85369658054594],
    bahrain: ['Bahrain International Circuit', '<https://openweathermap.org/city/290291>', 26.032239221255345, 50.5113078222162],
    belgium: ['Circuit of Spa-Francorchamps', '<https://openweathermap.org/city/2791834>', 50.44459039545755, 5.965672046747852],
    brazil: ['Autódromo José Carlos Pace', '<https://openweathermap.org/city/3464739>', -23.704643095024938, -46.698682833684316],
    canada: ['Circuit Gilles Villeneuve', '<https://openweathermap.org/city/6077243>', 45.50149916333356, -73.52241155407157],
    china: ['Shanghai International Circuit', '<https://openweathermap.org/city/1806508>', 31.33949985570138, 121.22237968498541],
    europe: ['Antic Circuit de F1', '<https://openweathermap.org/city/2509954>', 39.46106574699339, -0.31970409972685354],
    france: ['Circuit Paul Ricard', '<https://openweathermap.org/city/3004838>', 43.25141701591202, 5.793406492343746],
    germany: ['Hockenheimring Baden-Württemberg', '<https://openweathermap.org/city/2902852>', 49.32788300816287, 8.566463156140525],
    'great britain': ['Silverstone Circuit', '<https://openweathermap.org/city/2637827>', 52.069454462796074, -1.0208241390455577],
    hungary: ['Hungaroring', '<https://openweathermap.org/city/3047986>', 47.5798821047699, 19.248048998164897],
    italy: ['Autodromo Nazionale Monza', '<https://openweathermap.org/city/3182066>', 45.61745261775388, 9.281818148301141],
    japan: ['Suzuka Circuit', '<https://openweathermap.org/city/6696932>', 34.845712783073594, 136.53906018316073],
    malaysia: ['Sepang International Circuit', '<https://openweathermap.org/city/7697719>', 2.7610952178983994, 101.73767854302483],
    mexico: ['Autódromo Hermanos Rodríguez', '<https://openweathermap.org/city/3526700>', 19.40562487521122, -99.09198684730788],
    monaco: ['Circuit de Monaco', '<https://openweathermap.org/city/3319178>', 43.734446145607016, 7.422652496651426],
    russia: ['Sochi Autodrom', '<https://openweathermap.org/city/874636>', 43.410901353955765, 39.97162417612603],
    singapore: ['Marina Bay Street Circuit', '<https://openweathermap.org/city/1880252>', 1.2915466098000035, 103.8643057152074],
    spain: ['Circuit de Barcelona-Catalunya', '<https://openweathermap.org/city/3114267>', 41.56977250374497, 2.257880120083659],
    turkey: ['Intercity Istanbul Park', '<https://openweathermap.org/city/751170>', 40.952655924954776, 29.405838317342436],
    usa: ['Circuit of the Americas', '<https://openweathermap.org/city/4692997>', 30.13284741593161, -97.64013357640289]
}

console.log("bot startup");

function getpage(url) {
    console.log("Loading igp data from website.")
    request(url, (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

          if (url.includes('wings')) {
              let WingProm= new Promise(resolve => {
                $('p').each(function() {
                    wings.push($(this).text());
                                   
                });
                resolve(true);
              })
              WingProm.then(() => {
                data.set("1", {wingdata: wings})
              }).then(() => {
            console.log("Loaded igp data.")
            console.log(data.get("1"))
              })
              
            } else {
              let InfoProm= new Promise(resolve => {
                $('p').each(function() {
                    info.push($(this).text());
                });
                resolve(true);
              });
              InfoProm.then((info) => {
              data.set("1", {infodata: info})
                })
            }
          
        }
    });
}
getpage(wingp);
getpage(infop);

function getinfo(type, circuit) {
    console.log(`Looking up data:`)
    let startID = (type.findIndex(v => v.toLowerCase().includes(circuit.toLowerCase())));
    let endID;

    if (type == wings) {
      console.log(`Looking up wings data`)
        let blankID = type.indexOf('', startID);
        for (let i = 0; i < 3; i++) {
            blankID = type.indexOf('', blankID + 1);
        }
        endID = blankID;
    } else if (type == info) {
      console.log(`Looking up info data`)
        endID = type.indexOf('', startID + 2);
    }
  console.log(type.slice(startID, endID))
    return type.slice(startID, endID);
}

async function getWeather(circuit) {
    console.log(`Loading weather for ${circuit}`)
    return new Promise(resolve => {
        let weatherdata;
      console.log(circuits[circuit])
        if (circuits[circuit] != undefined) {

            weather.setLocationByCoordinates(parseFloat(circuits[circuit][2]), parseFloat(circuits[circuit][3]));

            weather.getCurrent().then(data => {
                let weatherdata1 = `${circuits[circuit][0]}\nCurrent:\n${data.weather.temp.cur}\u00B0C\n${data.weather.rain}mm\n${data.weather.description}\n\n`;
                return weatherdata1;
            }).then(weatherdata1 => {

                    weather.getForecast().then(data => {
                      let i = data.findIndex(x => x.dt.toString().includes('15:00'));
                      let i2 = data.slice(i+1).findIndex(x => x.dt.toString().includes('15:00'));
                      i2=i2+1;
                      let timenow = new Date().getHours();
                      let daynow = new Date().getDay();
                      console.log(timenow)

                      if (timenow < 15 && daynow !=0) {
                        weatherdata = weatherdata1 + `Forecast At 15:00UTC today:\n`
                        weatherdata+= `${data[i].weather.temp.cur}\u00B0C\n${data[i].weather.rain}mm \n${data[i].weather.description}`;

                          } else if (daynow == 6 || daynow == 0 && timenow<15) {
                        weatherdata = weatherdata1 + `Forecast At 15:00UTC on Monday:\n`
                        weatherdata+= `${data[i2].weather.temp.cur}\u00B0C\n${data[i2].weather.rain}mm \n${data[i2].weather.description}`;
                      } else if (timenow >=16 || daynow == 0 ) {
                        weatherdata = weatherdata1 + `Forecast At 15:00UTC tomorrow:\n`
                        weatherdata+= `${data[i].weather.temp.cur}\u00B0C\n${data[i].weather.rain}mm \n${data[i].weather.description}`;
                      } else {
                        weatherdata=weatherdata1;
                      }
                        console.log("Weather loaded:" + weatherdata)
                        return weatherdata;


            });
        setTimeout(function() {
            resolve(weatherdata);
        }, 2000)

    });

} else {
          resolve(weatherdata);
}
    })
}

app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
  const interaction = req.body;

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log(interaction.data.name)

    if(interaction.data.name == 'igp'){
      console.log('Message received! Message content: ' + interaction.data.options[0].name);
 
      let circuit = interaction.data.options[0].value;
      let inforesponse;
      let wingresponse;
      if (interaction.data.options[0].name=='info') {
        inforesponse = '```' + getinfo(info, circuit) + '```';
        inforesponse = inforesponse.replaceAll(',', '\n');
        wingresponse = '```' + getinfo(wings, circuit) + '```';
        wingresponse = wingresponse.replaceAll(',', '\n');
      }
        let weatherresponse;
        let WeatherProm= new Promise(resolve => {
            let weatherdata = getWeather(circuit);
            resolve(weatherdata)
        })
        WeatherProm.then(weatherdata => {
          let WeatherProm2 = new Promise(resolve => {
            weatherresponse = ('```' + weatherdata + '```')
                weatherresponse += circuits[circuit][1];
              
              resolve (weatherresponse)
           
        })
            WeatherProm2.then((weatherresponse) => {
              let reply;
              if (interaction.data.options[0].name=='info') {
              reply= inforesponse + wingresponse + weatherresponse;
              } else { reply=weatherresponse }
            console.log(reply)
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
          content: reply         
          }
          });

      })
  //});

  });
    }

}
});



app.get('/register_commands', async (req,res) =>{
  let slash_commands = [
    {
      "name": "igp",
      "description": "The iGP Champions League bot",
      "options": [{
        "name": "info",
        "description": "Replies with all race info",
          "type": 3,
          "required": false,
        "choices": [
        {
            "name": "Bahrain",
            "value": "bahrain"
        },
        {
            "name": "Australia",
            "value": "australia"
        }
        ]
    },
                  {"name": "weather",
                      "description": "Replies with only the weather info",
                        "type": 3,
                      "required": false,
                      "choices": [
                      {
                          "name": "Bahrain",
                          "value": "bahrain"
                      },
                      {
                          "name": "Australia",
                          "value": "australia"
                      }
                      ]
                  }
                ]
    }
  ]
  try {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.put(
      `/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
      slash_commands
    )
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e.code)
    console.error(e.response?.data)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(8999, () => {

})
