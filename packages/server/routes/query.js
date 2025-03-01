import { pipe } from "@screenpipe/js";

if (typeof self === "undefined") {
  global.self = global;
}

async function queryScreenpipe() {
  // get content from last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const results = await pipe.queryScreenpipe({
    startTime: fiveMinutesAgo,
    limit: 20,
    contentType: "audio", // can be "ocr", "audio", or "all"
  });

  for(const item of results.data) {
    console.log(item.content.transcription)
  }

  // console.log(results.data)

  if (!results) {
    console.log("no results found or error occurred");
    return;
  }

  // console.log(`found ${results.pagination.total} items`);

  // // process each result
  // for (const item of results.data) {
  //   if (item.type === "OCR") {
  //     console.log(`OCR: ${JSON.stringify(item.content)}`);
  //   } else if (item.type === "Audio") {
  //     console.log(`transcript: ${JSON.stringify(item.content)}`);
  //   }
  // }
}

queryScreenpipe().catch(console.error);