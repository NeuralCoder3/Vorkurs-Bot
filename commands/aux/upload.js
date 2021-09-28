const shell = require('shelljs');
const exec = require("child_process").execSync;
const fs = require('fs')
const { parentPort, threadId, workerData } = require('worker_threads');
var dateFormat = require('dateformat');

var date = new Date();
var timestamp = dateFormat(date,"dd.mm.");

uebungMapping={
    "13.09.": "sprachen",
    "14.09.": "sprachen",
    "15.09.": "aussagenlogik",
    "16.09.": "praedikatenlogik",
    "17.09.": "praedikatenlogik",

    "20.09.": "beweisen",
    "21.09.": "beweisen",
    "22.09.": "textbeweise",
    "23.09.": "textbeweise",
    "24.09.": "textbeweise",

    "27.09.": "mengen",
    "28.09.": "relationen",
    "29.09.": "relationen",
    "30.09.": "relationen",
    "01.10.": "relationen",

    "04.10.": "induktion",
    "05.10.": "induktion",
    "06.10.": "induktion",
    "07.10.": "induktion"
};

warmupMapping={
    "13.09.": "A1",
    "14.09.": "A2",
    "15.09.": "A3",
    "16.09.": "A4",
    "17.09.": "A5",

    "20.09.": "B1",
    "21.09.": "B2",
    "22.09.": "B3",
    "23.09.": "B4",
    "24.09.": "B5",

    "27.09.": "C1",
    "28.09.": "C2",
    "29.09.": "C3",
    "30.09.": "C4",
    "01.10.": "C5",

    "04.10.": "D1",
    "05.10.": "D2",
    "06.10.": "D3",
    "07.10.": "D4"
};

// console.log(timestamp,warmupMapping[timestamp]);

boardId=workerData.boardId
boardUrl=`https://miro.com/app/board/${boardId}/`;
uebung=workerData.uebung
flush=workerData.flush
gitlabToken=workerData.gitlabToken


console.log("Upload to "+boardId)

// console.log("Start");
// exec(` sleep 2;ls > tmp.txt`)
// exec(` sleep 2;python -c "print('HI')" > tmp.txt`)
if(uebung) {
    // date="aussagenlogik";
    date=uebungMapping[timestamp];
    // date="relationen";
    wanted=`uebung_${date}.pdf`;
    urlpath=`sheets/daily/2021/${wanted}`;
} else {
    date=warmupMapping[timestamp];
    // date="A2";
    wanted=`warmup_${date}.pdf`;
    urlpath=`sheets/warmup/2021/${wanted}`;
}
if(! date) {
    console.log("Finished Board without content: "+boardId);
    try {
        parentPort.postMessage(`Es gibt heute kein Blatt. Hier ist dein [Board](${boardUrl}).`);
    } catch(err) {
        console.error(err)
    }
    return;
}
console.log(date);
url=`https://vorkurs.cs.uni-saarland.de/gitlab/api/v4/projects/5/jobs/artifacts/master/raw/pdfs/${urlpath}?job=build`;
localPath=`./tmp/${wanted}`;

fileExists=false;
try {
    if (fs.existsSync(localPath)) {
        fileExists=true;
    }
} catch(err) {
    console.error(err)
}
if(flush) {
    fileExists=false;
}
if(!fileExists){
    console.log("Download File");
    exec(` curl --output ${localPath} --header "PRIVATE-TOKEN: ${gitlabToken}" ${url} `);
}
try {
    exec(` python miro.py ${boardId} ${localPath} ${flush}`);
    // exec(` sleep 10;echo HI`);
    try {
        // editInteraction(client,interaction,`[Hier](${url}) ist dein Whiteboard mit ${uebung ? 'Übungsblatt' : 'Warmup Blatt'}.`);
        parentPort.postMessage(`[Hier](${boardUrl}) ist dein Whiteboard mit ${uebung ? 'Übungsblatt' : 'Warmup Blatt'}.`);
    } catch (error) {
        console.error(error);
    }
    console.log("Finished Board: "+boardId);
} catch(err) {
    console.log("Finished Board with error: "+boardId);
    try {
        parentPort.postMessage(`Es gab einen Fehler beim Hinzufügen zum [Board](${boardUrl}).`);
        // editInteraction(client,interaction,`Es gab einen Fehler beim Hinzufügen zum [Board](${url}).`);
    } catch(err) {
        console.error(err)
    }
}
// shell.exec()
