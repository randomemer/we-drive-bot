/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import { setGlobalOptions } from "firebase-functions/v2/options";

setGlobalOptions({
  region: "us-east1",
  maxInstances: 10,
});

export const pollDiscordBot = onSchedule(
  "*/10 * * * *",
  async function (event) {
    try {
      const resp = await axios.get(`${process.env.HOST}`);

      logger.info(resp.data);
    } catch (error) {
      logger.error(event.jobName, error);
    }
  }
);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
