module.exports = {
	name: 'ask',
	description: 'Fragt im Forum',
	args: [
        {
            name: "titel",
            description: "Titel der Frage",
            required: true,
            type: 3 // STRING 
        }
    ],
    run(client,interaction) {
        var title=encodeURI(interaction.data.options.find(itm => itm.name.toLowerCase()=="titel").value);
        var body=encodeURI("");
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: `Bitte folge diesem [Link](https://vorkurs-discourse.cs.uni-saarland.de/new-topic?title=${title}&body=${body}&category_id=16&tags=discord). Du musst gegebenfalls die Kategorie ändern.`
                }
            }
        }).catch(function(err){
            console.log(err);
        })
    },
};
