const request = ({
  url,
  method = 'post',
  data,
  headers = {},
  onProgress,
  requestList,
}: {
  url: string;
  method?: 'post' | 'get';
  data?: any;
  headers?: Record<string, any>;
  onProgress?: any;
  requestList?: { key: string; xhr: any }[];
}): Promise<any> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const key = `${Math.floor(Math.random() * 100000)}`;
    onProgress && (xhr.upload.onprogress = onProgress);
    xhr.open(method, url);
    Object.keys(headers).forEach((key) => xhr.setRequestHeader(key, headers[key]));
    xhr.send(data);
    requestList && requestList.push({ key, xhr });
    xhr.onload = (e: any) => {
      if (requestList) {
        const index = requestList.findIndex((n) => n.key === key);
        requestList.splice(index, 1);
      }
      resolve(JSON.parse(e.target.response));
    };
  });

export default request;
