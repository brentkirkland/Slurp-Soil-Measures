const Datastore = require('@google-cloud/datastore');
const projectId = 'slurp-165217';
const datastore = Datastore({
  projectId: projectId
});

/**
 * Background Cloud Function to be triggered by Pub/Sub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} The callback function.
 */
exports.storeSoilMeasures = function storeSoilMeasures (event, callback) {
  const pubsubMessage = event.data;

  var kind = 'soil_measure'
  var name = event.eventId
  var taskKey = datastore.key([kind, name]);

  var data = JSON.parse(Buffer.from(pubsubMessage.data, 'base64'))

  var task = {
    key: taskKey,
    data: {
      device_id: pubsubMessage.attributes.device_id,
      temp: data.temp,
      humidity: data.humidity,
      published_at: pubsubMessage.attributes.published_at
    }
  };

  datastore.save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}`);
  });

  kind = 'device'
  name = pubsubMessage.attributes.device_id
  taskKey = datastore.key([kind, name]);

  task = {
    key: taskKey,
    data: {
      last_temp: data.temp,
      last_humidity: data.humidity,
      device_id: name,
      last_updated: pubsubMessage.attributes.published_at
    }
  };

  datastore.save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}`);
  });

  callback();
};
