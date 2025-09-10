// This file is normally used for setting up analytics and other
// services that require one-time initialization on the client.

import { init } from "./core/init";

try {
  console.log("initing");
  init({ debug: false, mockForMacOS: false });
} catch (e) {
  console.log(e);
}
