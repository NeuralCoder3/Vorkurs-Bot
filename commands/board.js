function getBoard(channelId) {
	urlEntry=global.db.findOne({channel:channelId});
	// url=await global.keyv.get(channelId);
	if(!urlEntry){
		for (const board of global.boards) {
			// resChannel=await global.keyv.get(board);
			resChannel=global.db.findOne({board:board});
			if(!resChannel){
				urlEntry={channel:channelId,board:board};
				global.db.save(urlEntry);
				// await keyv.set(board, channelId);
				// await keyv.set(channelId, board);
				break;
			}
		}
	}
	if(!urlEntry) {
		urlEntry={channel:channelId,"https://miro.com/app/board/o9J_lx8Siyc=/"};
    }
	url=urlEntry.board;
	return url;
}

module.exports = {
	name: 'board',
	getBoard: getBoard,
	description: 'Erstellt ein Whiteboard zum gemeinsamen Beschreiben.',
	run(client,interaction) {
		let channelId=interaction.channel_id;
		url=getBoard(channelId);
        client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: `[Hier](${url}) ist dein Board.`
                }
            }
        }).catch(function(err){
            console.log(err); // log any error from the `then` or the readFile operation
        })
	},
};
