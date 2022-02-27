import express from "express";
import axios from "axios";
let app = express();
import logger from "morgan";
import { createClient } from "redis";

const client = createClient();
await client.connect();

app.use(express.json());
app.use(logger("dev"));

app.get("/photos", async function (req, res) {
  const photos = await client.get("photos");
  if (photos) {
    res.json(JSON.parse(photos))
  } else {
    try {
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/photos"
      );

      await client.setEx("photos", 3600, JSON.stringify(data));
      res.json(data);
    } catch(error) {
      console.error('error..>>', error)
      res.json({data: error})
    }
  }
});

app.get("/photos/:id", async function (req, res) {
  const { id } = req.params;
  const photo = await client.get(`photo-${id}`);
  if (photo) {
    res.json(JSON.parse(photo))
  } else {
    try {
      const { data } = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${id}`
      );

      await client.setEx(`photo-${id}`, 3600, JSON.stringify(data));
      res.json(data);
    } catch(error) {
      console.error('error>>', error)
      res.json({data: error})
    }
  }
});

app.use((err, req, res, next) => {
  res.status(400).json({
    msg: err,
  });
});

app.listen(4200, () => console.log("app lisening"));
