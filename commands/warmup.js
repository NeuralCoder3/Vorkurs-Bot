const shell = require('shelljs');
const axios = require('axios').default;
const exec = require("child_process").execSync;
const board = require('./board');
const fs = require('fs')

const editInteraction = async (client, interaction, response) => {
    // Set the data as embed if reponse is an embed object else as content
    const data = typeof response === 'object' ? { embeds: [ response ] } : { content: response };
    // Get the channel object by channel id:
    const channel = await client.channels.resolve(interaction.channel_id);
    // Edit the original interaction response:
    return axios
        .patch(`https://discord.com/api/v8/webhooks/${global.appId}/${interaction.token}/messages/@original`, data)
        .then((answer) => {
            // Return the message object:
            return channel.messages.fetch(answer.data.id)
        },console.err).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
};


function createSheetBoard(client, interaction, uebung=false, flush=false) {
    let channelId=interaction.channel_id;
    url=board.getBoard(channelId);

    // const channel = client.channels.cache.find(channel => channel.id === channelId);

    // console.log("interaction: ",client.api.interactions(interaction.id, interaction.token))
    // console.log("callback: ",client.api.interactions(interaction.id, interaction.token).callback)

    try {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4, // 5 for waiting symbol, but 5 can not contain text
            data: {
                content: `Ich sende das ${uebung ? 'Übungsblatt' : 'Warmup Blatt'} [hierher](${url}).${flush? " Zudem wird der Cache geleert." : ""}`
            }
        }
    }).catch(function(err){
        console.log(err); // log any error from the `then` or the readFile operation
    });
    } catch (error) {
        console.error(error);
    }

    // console.log(res);

    // console.log(url);
    matches=url.match(/https:\/\/miro.com\/app\/board\/(.*?=)(\/)?/);
    boardId=matches[1];
    console.log("Start on "+boardId);
    const worker = new Worker('./commands/aux/upload.js', { workerData: 
        {
            boardId: boardId,
            uebung: uebung,
            gitlabToken: global.gitlabToken,
            flush: flush
        }
    });
    worker.on('message',msg =>
        {
            editInteraction(client,interaction,msg);
            console.log("Finished")
        }
    );

    // setTimeout(() => fillBoard(client,interaction,boardId,uebung),0);

    // res.then(val => val.write("HI"))
    // client.api.interactions(interaction.id, interaction.token).callback.post({
    //     data: {
    //         type: 4,
    //         data: {
    //             content: `[Hier](${url}) ist dein Whiteboard mit Warmup Blatt.`
    //         }
    //     }
    // });
}

module.exports = {
	name: 'warmup',
	description: 'Erstellt ein Board mit dem aktuellen Warmup Blatt.',
	createSheetBoard: createSheetBoard,
	// fillBoard: fillBoard,
	editInteraction: editInteraction, // TODO: move to index.js
    run(client,interaction) {
        createSheetBoard(client,interaction,false);
    },
};
