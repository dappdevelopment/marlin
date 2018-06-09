function add_master_node(master_node_id, master_node_ip) {
    dom_string = $('<div class="col-md-4" style="margin-bottom:20px;">\
                    <div class="card">\
                        <div class="card-body">\
                            <div class="row">\
                                <div class="col-7">\
                                    <h5 class="card-title">'+ master_node_ip + '</h5>\
                                </div>\
                                <div class="col-5">\
                                    <h5 class="card-title" style="text-align: right;" id="status_master_'+ master_node_id + '">\
                                        <span style="color: green;">&#9673;</span>\
                                        Up\
                                    </h5>\
                                </div>\
                                <div class="col-12">\
                                    <h6 class="card-subtitle mb-2 text-muted" id="tokens_master_'+ master_node_id + '">tokens: 0</h6>\
                                    <p class="card-text console" id="console_master_'+ master_node_id + '"></p>\
                                    <hr>\
                                    <h6 class="card-subtitle mb-2 text-muted">Relay Nodes</h6>\
                                </div>\
                                <div class="col-12 master" id="relay_'+ master_node_id + '">\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>');
    $('#masters').append(dom_string);
}

function add_relay_node(master_node_id, relay_node_id, relay_node_ip) {
    dom_string = $('<div class="card" style="margin-bottom:10px;">\
                        <div class="card-body">\
                            <div class="row">\
                                <div class="col-7">\
                                    <h5 class="card-title">'+ relay_node_ip + '</h5>\
                                </div>\
                                <div class="col-5">\
                                    <h5 class="card-title" style="text-align: right;" id="status_relay_'+ relay_node_id + '">\
                                        <span style="color: green;">&#9673;</span>\
                                        Up\
                                    </h5>\
                                </div>\
                                <div class="col-12">\
                                    <h6 class="card-subtitle mb-2 text-muted" id="id_relay_'+ relay_node_id + '"> id: ' + relay_node_id + '</h6>\
                                    <h6 class="card-subtitle mb-2 text-muted" id="tokens_relay_'+ relay_node_id + '">tokens: 0</h6>\
                                    <p class="card-text console" id="console_relay_'+ relay_node_id + '"></p>\
                                </div>\
                            </div>\
                        </div>\
                    </div>');
    $('#relay_' + master_node_id).append(dom_string);
}

function change_status(node_id, status) {
    if (status) {
        $('#status_' + node_id).replaceWith('<h5 class="card-title" style="text-align: right;" id="status_' + node_id + '">\
            <span style="color: green;">&#9673;</span>\
            Up\
        </h5>');
    } else {
        $('#status_' + node_id).replaceWith('<h5 class="card-title" style="text-align: right;" id="status_' + node_id + '">\
            <span style="color: red;">&#9673;</span>\
            Down\
        </h5>');
    }
}

function add_console_master_text(node_id, text) {
    $('#console_master_' + node_id).prepend(text + "<br />");
}

function add_console_relay_text(node_id, text) {
    $('#console_relay_' + node_id).prepend(text + "<br />");
}

function change_tokens_master_won(node_id, text) {
    $('#tokens_master_' + node_id).text("tokens: " + text);
}

function change_tokens_relay_won(node_id, text) {
    $('#tokens_relay_' + node_id).text("tokens: " + text);
}