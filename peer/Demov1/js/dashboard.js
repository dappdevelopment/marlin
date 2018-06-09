$(document).ready(function () {

    var app_id = "517573"
    var key = "35174145270aea54e5c9"
    var secret = "d01a6d930ace98914cbc"
    var cluster = "mt1"
    var pusher = new Pusher(
      key, {
      cluster: cluster
    });



    $.getJSON('/getMasterData', function(data){
        console.log(data);
        for(i=0; i<data.masterNodeArray.length; i++) {
            var tempRow = data.masterNodeArray[i];
            add_master_node(tempRow.id, tempRow.ip);
            if(tempRow.consolelog != null) {
                console.log(tempRow.consolelog);
                for(j=0; j<tempRow.consolelog.length; j++) {
                    console.log(tempRow.consolelog[j]);
                    add_console_master_text (tempRow.id, tempRow.consolelog[j]);
                    change_tokens_master_won(tempRow.id, tempRow.tokens);
                }
            }
        }


        $.getJSON('/getRelayData', function(data2) {
            for(i=0; i<data2.relayNodeArray.length; i++) {
                console.log(data2);
                var tempRow = data2.relayNodeArray[i];
                add_relay_node(tempRow.masternodeid, tempRow.id, tempRow.ip);
                if(tempRow.consolelog != null) {
                    for(j=0; j<tempRow.consolelog.length; j++) {
                        add_console_relay_text (tempRow.id, tempRow.consolelog[j]);
                        change_tokens_relay_won(tempRow.id, tempRow.tokens);
                    }
                }
            }
        });
    });

    var masterChannel = pusher.subscribe('master');
    masterChannel.bind("console", function(data) {
        console.log(data.id);
        console.log(data.message);
        add_console_master_text(data.id, data.message);
    });

    masterChannel.bind("tokens", function(data) {
        console.log(data.id);
        console.log(data.message);
        change_tokens_master_won(data.id, data.message);
    });

    var relayChannel = pusher.subscribe('relay');
    relayChannel.bind("console", function(data) {
        console.log(data.id);
        console.log(data.message);
        add_console_relay_text(data.id, data.message);
    });

    relayChannel.bind("tokens", function(data) {
        console.log(data.id);
        console.log(data.message);
        change_tokens_relay_won(data.id, data.message);
    });
});