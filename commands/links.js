module.exports = {
	name: 'links',
	description: 'Zeigt wichtige Links.',
    async run(client,interaction) {
        try {
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                embeds: [
                    {
                        title:"Links",
                        description:"Ein paar wichtige Links",
                        url: "https://vorkurs.cs.uni-saarland.de/",
                        color: 0x54e9a0,
                        thumbnail: {url:"https://vorkurs.cs.uni-saarland.de/cms/ss21/theme/Vorkurs/img/logo.png"},
                        fields: [
                            {
                                name:"CMS: https://vorkurs.cs.uni-saarland.de/cms/ss21/",
                                value:"Das [CMS](https://vorkurs.cs.uni-saarland.de/cms/ss21/) mit News, Materialien, Statusseite, ..."
                            },
                            {
                                name:"Forum: https://vorkurs-discourse.cs.uni-saarland.de/",
                                value:"[Hier](https://vorkurs-discourse.cs.uni-saarland.de/) kannst du alle deine Fragen stellen."
                            },
                            {
                                name:"Material: https://vorkurs.cs.uni-saarland.de/cms/ss21/materials/",
                                value:"[Hier](https://vorkurs.cs.uni-saarland.de/cms/ss21/materials/) findest du aktuelle Materialien wie SLP-Blatt, Übungsblatt und das Skript."
                            },
                            {
                                name:"Markdown-Demo: https://demo.hedgedoc.org/VS-PheYmRYudteqkamusjg?both",
                                value:"[Hier](https://demo.hedgedoc.org/VS-PheYmRYudteqkamusjg?both) sieht du einige wichtige Markdown Befehle."
                            },
                            {
                                name:"Beispiel Whiteboard: https://miro.com/app/board/o9J_knFi-8g=/",
                                value:"Ein generelles [Whiteboard](https://miro.com/app/board/o9J_knFi-8g=/) zum austesten. Benutze die Bot-Kommandos für privatere Whiteboards."
                            }
                        ]
                    }
                ]
                }
            }
        }).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
        } catch(err) {
            console.error(err)
        }
    },
};
