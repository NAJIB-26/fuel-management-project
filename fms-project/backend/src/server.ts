import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`FMS API running on port ${env.PORT}`);
});
