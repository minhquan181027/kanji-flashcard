const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const env = require("./config/env");
const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Khi chạy sau reverse proxy thì cần để rate limit nhận đúng IP người dùng
if (env.trustProxy) {
    app.set("trust proxy", Number(env.trustProxy) || env.trustProxy);
}

app.use(helmet());
app.use(cors({ origin: env.corsOrigins.length > 0 ? env.corsOrigins : true }));
app.use(express.json({ limit: "10kb" }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

// Chỉ mở cổng khi chạy trực tiếp (node src/app.js). Nếu file khác require app.js
// (ví dụ khi viết test) thì không mở cổng.
if (require.main === module) {
    app.listen(env.port, () => {
        console.log(`Server đang chạy tại http://localhost:${env.port}`);
    });
}

module.exports = app;