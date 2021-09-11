const shell = require('shelljs');
const exec = require("child_process").execSync;
const fs = require('fs');

module.exports = {
	name: 'markdown',
	description: 'Erstellt ein HedgeDoc (unterstützt Markdown und Latex) zum Zusammenarbeiten.',
	// args: [
    //     {
    //         name: "template",
    //         description: "Template Url",
    //         required: false,
    //         type: 3 // STRING 
    //     }
    // ],
    async run(client,interaction) {
        filePath="template.md";
        // if(interaction.data.options) {
        //     url=interaction.data.options.find(itm => itm.name.toLowerCase()=="template");
        //     if(url) {
        //         try {
        //             url = new URL(url); // TODO: read raw hedgedoc content
        //             shell.exec(`curl ${url} > /tmp/Tmp${uuid}.txt`)
        //         } catch (_) {
        //             return false;  
        //         }
        //     }
        // }
        exec("curl -v -XPOST -H 'Content-Type: text/markdown' 'https://demo.hedgedoc.org/new' --data-binary @"+filePath+" > /tmp/Url.txt")
        url=fs.readFileSync("/tmp/Url.txt","utf8").replace("Found. Redirecting to ","")+"?both";

        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: `Dein Dokument ist [hier](${url}).`
                }
            }
        }).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
    },
};
