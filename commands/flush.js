const warmup = require('./warmup');
const urlExists = require('url-exists');


module.exports = {
	name: 'flush',
	description: 'Erstellt ein Board mit dem aktuellen Übungsblatt.',
    run(client,interaction) {
        var userid=interaction.member.user.id;
        if(global.ids.indexOf(userid)==-1) {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Du bist nicht berechtigt diesen Befehl auszuführen.`
                    }
                }
            }).catch(function(err){
                console.log(err); // log any error from the `then` or the readFile operation
            })
        }else {
            // /gitlab/vorkurs
            urlExists('https://vorkurs.cs.uni-saarland.de', function(err, exists) {
                if(exists) {
                    warmup.createSheetBoard(client,interaction,uebung=true,flush=true);
                }else{
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: `Die Server sind down. Ein Leeren der Caches wäre unklug.`
                            }
                        }
                    }).catch(function(err){
                        console.log(err); // log any error from the `then` or the readFile operation
                    });
                }
            });
        }
        // console.log(client);
        // console.log(interaction);
        // warmup.createSheetBoard(client,interaction,uebung=true,flush=true);
    },
};
