import axios from 'axios';
import dotenv from 'dotenv/config';
import fs from 'fs';

axios({
  method: 'post',
  url: process.env.API_ENDPOINT + '/v1/chain/get_producers',
  data: {
    'limit':'20000',
    'json':true
  }
}).then((res) => {
  let bps = [];
  for (let i = 0; i < res.data.rows.length; i++) {
    let row = res.data.rows[i];
    if (row.is_active !== 1) continue;
    bps.push({actor: row.owner, permission: 'active'})
  }
  fs.writeFile(process.env.OUTPUT_FOLDER + '/permissions.json', JSON.stringify(bps, null, 4), {flag: 'a'}, err => {
    if (err) {
      console.error(err);
    } else {
      console.log('Permissions written to '+ process.env.OUTPUT_FOLDER + '/permissions.json')
    }
  });
}).catch(e => {
  console.log(e)
})
