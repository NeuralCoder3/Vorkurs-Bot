module.exports = {
	name: 'unsubscribe',
	description: 'Bestellt automatische Warmup Blätter ab.',
    run(client,interaction) {
        let channelId=interaction.channel_id;
        entry=global.sub_db.findOne({uebung:false,channelId:channelId});
        if(!entry) {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Es besteht keine Anmeldung für diesen Channel.`
                    }
                }
            }).catch(function(err){
                console.log(err); // log any error from the `then` or the readFile operation
            })
            return;
        }
        global.sub_db.remove({_id: entry._id});
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: `Die Anfrage wurde verarbeitet. Warmup Blätter werden nicht länger automatisch hinzugefügt.`
                }
            }
        }).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
    },
};
