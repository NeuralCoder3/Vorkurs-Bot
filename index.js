const fs = require('fs');
const Discord = require('discord.js');
global.Discord=Discord;
const { prefix, token, appId, gitlabToken} = require('./config.json');
const readline = require('readline');
// const Keyv = require('keyv');
// var Datastore = require('nedb')
const DB = require('diskdb');
// import { Worker } from 'worker_threads';
const { Worker } = require('worker_threads');
const schedule = require('node-schedule');

var util = require('util');
var dateFormat = require('dateformat');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'});
var log_stdout = process.stdout;

console.log = function(d) { //
	var timestamp = dateFormat(new Date(),"dd.mm.yyyy HH:MM:ss");
  log_file.write(timestamp+": "+util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};


global.Worker=Worker
// global.a=5;
// const worker = new Worker('./executer2.js', { workerData: {a:5} });
// console.log("From Main")

Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};
Date.prototype.getDOY = function() {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getMonth();
    var dn = this.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};

// var date = new Date(); 
// console.log(date.getHours());



const Intents = Discord.Intents;

const client = new Discord.Client({intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_INTEGRATIONS,
	// Intents.FLAGS.GUILD_MESSAGES,
	// Intents.FLAGS.GUILD_MESSAGE_TYPING,
	// Intents.FLAGS.DIRECT_MESSAGES
]});
global.client=client;
global.gitlabToken=gitlabToken;
global.appId=appId;
client.commands = new Discord.Collection();
client.commandList = [];

// console.log(`sqlite:${__dirname}/data.sqlite`);
// const keyv = new Keyv(`sqlite:${__dirname}/data.sqlite`);
// global.keyv = new Keyv(`sqlite:data.sqlite`);
// global.keyv.on('error', err => console.error('Keyv connection error:', err));

// global.db = new Datastore({ filename: `${__dirname}/data.sqlite`, autoload: true });
// db.insert({a:"B",b:"XYZ"});

global.dbAll = DB.connect(`${__dirname}/`,['data','subscription']);
global.db=global.dbAll.data
global.sub_db=global.dbAll.subscription
// global.db.save({a:"B",b:"XYZ"});
// console.log(global.db.findOne({a:"B"}))
// console.log(global.db.findOne({a:"C"}))

const board = require('./commands/board');

// every 20s on Mon-Fri
// */20 * * * * 1-5
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)
// const job = schedule.scheduleJob('0 */5 * * * *', function(){
const job = schedule.scheduleJob('0 */15 9-11 * * 1-5', function(){
// const job = schedule.scheduleJob('0 */30 9-11 * * 1-5', function(){
// const job = schedule.scheduleJob('0 */5 8 * * 1-5', function(){
	// console.log('The answer to life, the universe, and everything!');

	// uebung=false;
	// channelId="744652619506516198";
	console.log("Rufe Subs auf");
	var current=new Date();
	if(current.getDay()<1 || current.getDay()>5)
		return;
	subs=global.sub_db.find();
	for(const sub of subs) {
		let uebung=sub.uebung;
		let channelId=sub.channelId;
		let _id=sub._id;

		var last=new Date(sub.executed);
		console.log(`At channel ${channelId} Übung: ${uebung}.`)
		// console.log(`  last: ${last.getDOY()} ${last.getFullYear()}`)
		// console.log(`  current: ${current.getDOY()} ${current.getFullYear()}`)
		if(last.getFullYear()>=current.getFullYear() && last.getDOY()>=current.getDOY()) {
			console.log("  Already executed today");
			continue;
		}


		const channel = client.channels.cache.find(channel => channel.id === channelId);

		// channel.send("Msg");
		// continue;
		url=board.getBoard(channelId);
		matches=url.match(/https:\/\/miro.com\/app\/board\/(.*?=)(\/)?/);
		let boardId=matches[1];
		console.log("Start Schedule on "+boardId);
		const worker = new Worker('./commands/aux/upload.js', { workerData: 
			{
				boardId: boardId,
				uebung: uebung,
				gitlabToken: global.gitlabToken
			}
		});
		worker.on('message',msg =>
			{
				// Fehler extra behandeln
				global.sub_db.update({_id: _id},{executed:current.getTime()});
				channel.send(msg);
				console.log("Finished Scheduled "+boardId+" with id "+_id)
			}
		);
	}

});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if(!command.name){
		console.log(file);
		continue;
	}
	if(!command.description) {
		command.description="-";
	}
	client.commands.set(command.name, command);
	client.commandList.push(command)
}



// invite : https://discord.com/api/oauth2/authorize?client_id=761552848752082985&permissions=8&scope=bot%20applications.commands
// options: https://github.com/MeguminSama/discord-slash-commands/blob/main/src/structures/ApplicationCommandOptions.ts
client.once('ready', () => {
	console.log('Ready!');
	const Guilds = client.guilds.cache.map(guild => guild);
	for(const guild of Guilds) {
		console.log(guild.name,guild.id);

		// TODO: Change for vorkurs server to global cmd
		for (const command of client.commandList) {
			// console.log(command.name,command.description);
			var regCmd;
			if(command.args) {
			regCmd={data: {
					name: command.name,
					description: command.description,
					options: command.args
				}};
			}else{
			regCmd={data: {
					name: command.name,
					description: command.description
				}};
			}
			//client.api.applications(client.user.id).guilds(guild.id).commands.post (regCmd);
			client.api.applications(client.user.id).commands.post (regCmd);
		}
	}


	// const serverGuild='739909254001065994';
	// client.api.applications(client.user.id).commands.post({data: {
	//     name: 'ping',
	//     description: 'ping pong!'
	// }})
	// client.api.applications(client.user.id).guilds(serverGuild).commands.post ({data: {
	// 	name: 'ping',
	// 	description: 'ping pong!'
	// }});


	try{
    client.ws.on('INTERACTION_CREATE', async interaction => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;

		for (const cmd of client.commandList) {
			if(command === cmd.name) {
				try {
					// console.log("Channel: "+interaction.channel_id)
					// console.log("Run "+command);
					cmd.run(client,interaction);
					// const worker = new Worker('./executer.js', { workerData: 
					// 	{
					// 		// cmd:cmd,
					// 		// gbl:global,
					// 		client:client,
					// 		interaction:interaction
					// 	}
					// });
				} catch (error) {
					console.error(error);
				}
				break;
			}
		}
    });
    } catch(err) {
        console.error(err)
    }

});

// const textchannels = require(`./commands/textchannels.js`);
// client.on('voiceStateUpdate', textchannels.handler);

/*
client.on('message', message => {
    // if (message.content.toLowerCase() == "!shutdown") { 
    //     message.channel.send("Shutting down...").then(() => {
    //         client.destroy();
    //     });
	// 	return;
    // }

});
*/

const readInterface = readline.createInterface({
    input: fs.createReadStream('boards.txt'),
    // output: process.stdout,
    console: false
});

global.boards=[];
readInterface.on('line', function(line) {
	if(!line.startsWith("https"))
		return;
	global.boards.push(line)
	// console.log("B:"+line);
	// if(await keyv.get(line))
});



client.login(token);
