const HOST = 'vidsrc.cc';

async function episode(data_id_1, data_id_2, type, s, e) {
  if (type == 'movie') {
    const url = `https://${HOST}/api/episodes/${data_id_2}/servers?id=${data_id_1}&type=${type}`;
    let resp = await (await fetch(url)).json();
    let id1 = resp['data'][0]['hash'];
    let id2 = resp['data'][1]['hash'];
    const url1 = `https://${HOST}/api/source/${id1}`;
    console.log(url1);
    const resp1 = await (await fetch(url1)).json();
    const url2 = `https://${HOST}/api/source/${id2}`;
    console.log(url2);
    const resp2 = await (await fetch(url2)).json();
    const result_1 = {
      source1: resp1
    };
    const result_2 = {
      source2: resp2
    };
    const combinedResponse = { ...result_1, ...result_2 };
    console.log(`combinedResponse : ${JSON.stringify(combinedResponse, null, 2)}`);
    return combinedResponse;
  };

  if (type == 'tv') {
    const url = `https://${HOST}/api/episodes/${data_id_2}/servers?id=${data_id_1}&type=tv&season=${s}&episode=${e}`;
    console.log(url);
    let resp = await (await fetch(url)).json();
    let id1 = resp['data'][0]['hash'];
    let id2 = resp['data'][1]['hash'];
    const url1 = `https://${HOST}/api/source/${id1}`;
    console.log(url1);
    const resp1 = await (await fetch(url1)).json();
    const url2 = `https://${HOST}/api/source/${id2}`;
    console.log(url2);
    const resp2 = await (await fetch(url2)).json();
    const result_1 = {
      source1: resp1
    };
    const result_2 = {
      source2: resp2
    };
    const combinedResponse = { ...result_1, ...result_2 };
    console.log(`combinedResponse : ${JSON.stringify(combinedResponse, null, 2)}`);
    return combinedResponse;
  }

}

export async function getvmovie(id) {
  console.log(`https://${HOST}/v2/embed/movie/${id}`);
  let resp = await (await fetch(`https://${HOST}/v2/embed/movie/${id}`)).text();

  let regex = /data-id="(.*?)"/g;
  let matches = [];
  let match;

  while ((match = regex.exec(resp)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length >= 2) {
    let data_id_1 = matches[0];
    let data_id_2 = matches[1];
    return await episode(data_id_1, data_id_2, 'movie');
  } else {
    throw new Error("Failed to find two data-id values in response.");
  }
}

export async function getvserie(id, s, e) {
  console.log(`https://${HOST}/v2/embed/tv/${id}/${s}/${e}`);
  let resp = await (await fetch(`https://${HOST}/v2/embed/tv/${id}/${s}/${e}`)).text();
  let regex = /data-id="(.*?)"/g;
  let matches = [];
  let match;

  while ((match = regex.exec(resp)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length >= 2) {
    let data_id_1 = matches[0];
    let data_id_2 = matches[1];
    return await episode(data_id_1, data_id_2, 'tv', s, e);
  } else {
    throw new Error("Failed to find two data-id values in response.");
  }
}