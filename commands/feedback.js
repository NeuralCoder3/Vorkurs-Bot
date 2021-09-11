module.exports = {
	name: 'feedback',
	description: 'Feedback zum Bot geben',
	args: [
        {
            name: "text",
            description: "Feedback Text",
            required: true,
            type: 3 // STRING 
        }
    ],
    run(client,interaction) {
        var title=encodeURI("Bot Feedback");
        var body=encodeURI(interaction.data.options.find(itm => itm.name.toLowerCase()=="text").value);
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: `Bitte folge diesem [Link](https://vorkurs-discourse.cs.uni-saarland.de/new-message?username=Marcel.Ullrich&title=${title}&body=${body}&tags=discord) zum senden.`
                }
            }
        }).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
    },
};
