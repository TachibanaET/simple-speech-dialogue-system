'use strict';

export const postTo = (url, body, func) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/json; charset=UTF-8");
  
  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((json) => {
      func(json);
    })
    .catch((reason) => {
      console.log({ reason });
    })
}