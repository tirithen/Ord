var models = require('../models')
  , async = require('async')
  , key = ''
  , mongoose = models.mongoose
  , connectionString = models.connectionString;

function dropDatabase() {
  mongoose.disconnect(function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    mongoose.connect(connectionString, function (err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      mongoose.connection.db.dropDatabase(function (err) {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        console.log('Database was successfully dropped (if it existed)');
        process.exit(0);
      });
    });
  });
}

if (process.env.NODE_ENV === 'test' || process.argv[2] === '--force') {
  dropDatabase();
} else {
  console.log('Error: When not running in test environment, the flag --force is required');
  process.exit(1);
}
