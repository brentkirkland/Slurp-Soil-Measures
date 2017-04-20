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
exports.storeSoilMeasures = function helloPubSub (event, callback) {
  const pubsubMessage = event.data;

  const kind = 'soil_measure'
  const name = event.eventId
  const taskKey = datastore.key([kind, name]);

  const task = {
    key: taskKey,
    data: {
      device_id: pubsubMessage.attributes.device_id,
      data: Buffer.from(pubsubMessage.data, 'base64').toString(),
      published_at: pubsubMessage.attributes.published_at
    }
  };

  datastore.save(task)
  .then(() => {
    console.log(`Saved ${task.key.name}`);
  });

  callback();
};
