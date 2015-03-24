var request = require('request');
var pollArgs = require('yargs')
    .usage('Usage: $0 --db [database name] [--user [username]] [--pass [password]] [--host [hostname]]')
    .demand(['db']).argv;

var db = pollArgs.db;
var user = pollArgs.user || 'admin';
var pass = pollArgs.pass || 'admin';
var host = pollArgs.host || 'localhost';

function checkCount(error, response, body) {

  'use strict';

  if (!error && response.statusCode === 200) {
    var properties = JSON.parse(body)['database-status']['status-properties'];
    var state = properties.state.value;
    var count = properties['reindex-count'].value;
    if (state !== 'available') {
      console.log('The database is not available. Terminating.' + state);
      process.exit(1);
    }
    if (count > 0) {
      console.log('Reindex in progress. Sleeping...');
      setTimeout(sendRequest, 2000);
    }
  } else {
    console.log('Not able to retrieve status. Code=' + response.statusCode + '; ' + error);
    process.exit(2);
  }
}

function sendRequest() {
  'use strict';

  request.get('http://' + host + ':8002/manage/v2/databases/' + db + '?view=status&format=json',
    {
      'auth': {
        'user': user,
        'pass': pass,
        'sendImmediately': false
      }
    },
    checkCount
  );
}

sendRequest();
