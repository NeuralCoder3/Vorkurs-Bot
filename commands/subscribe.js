const board = require('./board');

module.exports = {
	name: 'subscribe',
	description: 'Bestellt automatisch tägliche Warmup Blätter.',
    run(client,interaction) {
        let channelId=interaction.channel_id;
		const channel = client.channels.cache.find(channel => channel.id === channelId);
        // console.log(channel);
        let channelName=channel.name;
        let uebung=false;
        url=board.getBoard(channelId);
        if(global.sub_db.findOne({
            uebung: uebung,
            channelId: channelId,
        })){
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Es besteht bereits eine Anmeldung. Warmup Blätter werden täglich in [dieses](${url}) Whiteboard hinzugefügt.`
                    }
                }
            }).catch(function(err){
                console.log(err);
            })
        }else{
            global.sub_db.save({
                uebung: uebung,
                channelId: channelId,
                channelName: channelName,
                executed: 0
            });
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Die Anfrage wurde verarbeitet. Warmup Blätter werden täglich in [dieses](${url}) Whiteboard hinzugefügt.`
                    }
                }
            }).catch(function(err){
                console.log(err);
            })
        }
    },
};
