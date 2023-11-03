import http from 'k6/http';
import { sleep } from 'k6';

const host = 'http://localhost:3000';

export const options = {
  vus: 100,
  duration: '5s',
};

export default function() {
  http.get(`${host}/anime/get-anime/${Math.floor(Math.random() * 100)}`);
  // http.get(`${host}/anime/get-anime/1`);

  sleep(1);
}
