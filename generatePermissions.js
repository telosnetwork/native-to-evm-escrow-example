import axios from 'axios';
import fs from 'fs';

const opts = [
  'telos.caleos.io', 
  '/v1/chain/get_table_rows?code=eosio&scope=eosio&table=producers', 
  {
    'accept': 'application/json',
    'content-type':'application/json'
  }
]

axios({
  method: 'post',
  url: 'https://telos.caleos.io/v1/chain/get_producers',
  data: {
    'limit':'20000',
    'json':true
  }
}).then((res) => {
  let bps = [];
  for (let i = 0; i < res.data.rows.length; i++) {
    let row = res.data.rows[i];
    if (row.is_active !== 1)
      continue

    bps.push({actor: row.owner, permission: 'active'})
  }
  fs.writeFile('output/permissions.json', JSON.stringify(bps, null, 4), {flag: 'a'}, err => {
    if (err) {
      console.error(err);
    } else {
      console.log('Permissions written to output/permissions.json')
    }
  });
})
