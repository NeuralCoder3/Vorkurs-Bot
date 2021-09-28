const warmup = require('./warmup');


module.exports = {
	name: 'uebung',
	description: 'Erstellt ein Board mit dem aktuellen Übungsblatt.',
    run(client,interaction) {
        warmup.createSheetBoard(client,interaction,true);
    },
};
