import https from 'https';
import querystring from 'querystring';
import iconv from 'iconv-lite';

const headers = {
  'validmark': 'aKVEnBbJF9Nip2Wjf4de/fSvA8W3X3iB4L6vT0Y5cxvZbEfEm17udZKUD2qy37dLRY3bzzHLDv+up/Yn3OTo5Q==',
};

const deviceId = '874C427C-7C24-4980-A835-66FD40B67605';
const version = '6.5.5';
const baseData = {
  product: 'EFund',
  deviceid: deviceId,
  MobileKey: deviceId,
  plat: 'Iphone',
  PhoneType: 'IOS15.1.0',
  OSVersion: '15.5',
  version,
  ServerVersion: version,
  Version: version,
  appVersion: version,
};

const requestWithNode = (url, params) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const query = querystring.stringify({ ...baseData, ...params });
    const options = {
      hostname: parsedUrl.hostname,
      path: `${parsedUrl.pathname}?${query}`,
      headers: headers,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          // 尝试使用UTF-8解码，如果失败则使用GBK
          let data;
          try {
            data = buffer.toString('utf8');
          } catch (e) {
            data = iconv.decode(buffer, 'gbk');
          }
          
          resolve(JSON.parse(data));
        } catch (e) {
          // 如果解析失败，返回原始数据
          const buffer = Buffer.concat(chunks);
          let data;
          try {
            data = buffer.toString('utf8');
          } catch (e) {
            data = iconv.decode(buffer, 'gbk');
          }
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

const postWithNode = (url, data) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = querystring.stringify({ ...baseData, ...data });
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          // 尝试使用UTF-8解码，如果失败则使用GBK
          let data;
          try {
            data = buffer.toString('utf8');
          } catch (e) {
            data = iconv.decode(buffer, 'gbk');
          }
          
          resolve(JSON.parse(data));
        } catch (e) {
          // 如果解析失败，返回原始数据
          const buffer = Buffer.concat(chunks);
          let data;
          try {
            data = buffer.toString('utf8');
          } catch (e) {
            data = iconv.decode(buffer, 'gbk');
          }
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
};

const request = async (url, params) => {
  try {
    return await requestWithNode(url, params);
  } catch (error) {
    console.error('Node.js request failed:', error);
    throw error;
  }
};

const post = async (url, data) => {
  try {
    return await postWithNode(url, data);
  } catch (error) {
    console.error('Node.js post failed:', error);
    throw error;
  }
};

const jsonp = async (url, callback, params) => {
  try {
    const data = await requestWithNode(url, params);
    const js = data.replace(/[\n]/g, '').replace(/\r/g, '');
    return JSON.parse(js.slice(callback.length + 1, js.length - 1));
  } catch (error) {
    console.error('Node.js jsonp failed:', error);
    throw error;
  }
};

const sse = async (url, params) => {
  try {
    return await requestWithNode(url, params);
  } catch (error) {
    console.error('Node.js sse failed:', error);
    throw error;
  }
};

export { request, post, jsonp, sse };