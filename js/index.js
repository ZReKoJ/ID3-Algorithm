'use strict'

var notifier = new Notifier();
var data = {
    header: ["TiempoExterior", "Temperatura", "Humedad", "Viento", "Jugar"],
    body: [
        ["soleado", "caluroso", "alta", "falso", "no"],
        ["soleado", "caluroso", "alta", "verdad", "no"],
        ["nublado", "caluroso", "alta", "falso", "si"],
        ["lluvioso", "templado", "alta", "falso", "si"],
        ["lluvioso", "frio", "normal", "falso", "si"],
        ["lluvioso", "frio", "normal", "verdad", "no"],
        ["nublado", "frio", "normal", "verdad", "si"],
        ["soleado", "templado", "alta", "falso", "no"],
        ["soleado", "frio", "normal", "falso", "si"],
        ["lluvioso", "templado", "normal", "falso", "si"],
        ["soleado", "templado", "normal", "verdad", "si"],
        ["nublado", "templado", "alta", "verdad", "si"],
        ["nublado", "caluroso", "normal", "falso", "si"],
        ["lluvioso", "templado", "alta", "verdad", "no"]
    ]
}

$(() => {
    makeResizableDiv('.setting-panel');
    makeResizableDiv('.info-panel');

    let settingFunctions = settingPanel('.setting-panel>.setting');

    new Treant(simple_chart_config);

    infoMessages();
});

function settingPanel(div) {
    let setting = $(div);

    let decisionInput = setting.find("input[type='text'].decision");
    decisionInput.on("change", (e) => {
        let value = decisionInput.val();
        let index = data.header.findIndex(element => element == value);
        if (index == -1) {
            if (data.header.length > 0) {
                CONFIG.DECISION = data.header[data.header.length - 1];
                decisionInput.val(data.header[data.header.length - 1]);
            }
            notifier.error(messages.error.paramNotInHeader);
        } else {
            CONFIG.DECISION = value;
        }
    });

    let delimiterInput = setting.find("input[type='text'].delimiter");
    delimiterInput.on("change", (e) => {
        CONFIG.DELIMITER = delimiterInput.val();
    });

    let headerInput = setting.find("input[type='file']#data-header");
    headerInput.on("change", (e) => {
        let reader = new FileReader();
        reader.onload = function () {
            let header = reader.result.split(CONFIG.DELIMITER);
            if (header.length > 0) {
                CONFIG.DECISION = header[header.length - 1];
                decisionInput.val(header[header.length - 1]);
            }
            header = header.map(element => element.replace("\n", ""));
            data.header = header;
            updateData();
        };
        reader.readAsText(event.target.files[0]);
    });

    let bodyInput = setting.find("input[type='file']#data-body");
    bodyInput.on("change", (e) => {
        let reader = new FileReader();
        reader.onload = function () {
            let body = reader.result.split("\n").map(line => line.split(CONFIG.DELIMITER));
            let max = Math.max.apply(null, body.map(line => line.length));
            body = body.filter(line => line.length == max);
            data.body = body;
            updateData();
        };
        reader.readAsText(event.target.files[0]);
    });

    let stateButton = setting.find("button.state");
    stateButton.on("click", () => {
        try {
            switch (stateButton.text()) {
                case "Ejecutar":
                    stateButton.text("Parar");
                    try {
                        let algorithm = new Algorithm(data, decisionInput.val());
                    } catch (err) {
                        notifier.error(err.message);
                    }
                    break;
                case "Parar":
                    stateButton.text("Ejecutar");
                    break;
            }
        } catch (err) {
            stateButton.text("Ejecutar");
            notifier.error(err.message);
        }
    });

    return {
    };
}

function updateData() {
    let table = $(".info-panel>.information>table");
    table.empty();

    let row = undefined;

    row = $("<tr></tr>");
    data.header.forEach(element => {
        row.append($("<th>" + element + "</th>"));
    });
    table.append(row);

    data.body.forEach(line => {
        row = $("<tr></tr>");
        line.forEach(element => {
            row.append($("<td>" + element + "</td>"));
        });
        table.append(row);
    });
}

function infoMessages() {
    let allInfoMessages = messages.info.uses.recursiveValues();
    setInterval(() => {
        notifier.info(allInfoMessages[
            Math.floor(Math.random() * allInfoMessages.length)
        ]);
    }, CONFIG.SHOW_MESSAGES_INTERVAL);
}