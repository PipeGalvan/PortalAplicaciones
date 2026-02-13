import http from 'http';
import https from 'https';
import net from 'net';

export const checkHealth = async (req, res) => {
  try {
    const { type, url, port, httpMethod = 'HEAD', healthEndpoint } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Tipo de verificación no especificado' });
    }
    
    let result;
    
    switch (type) {
      case 'http':
        result = await checkHttp(url, httpMethod, healthEndpoint);
        break;
      case 'tcp':
        result = await checkTcp(url, port);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de verificación no válido' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
};

function checkHttp(url, method = 'HEAD') {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method.toUpperCase(),
      timeout: 5000,
      headers: {
        'User-Agent': 'Portal-Aplicaciones-HealthCheck/1.0'
      }
    };
    
    const startTime = Date.now();
    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let status;
      let message;
      
      if (res.statusCode >= 200 && res.statusCode < 400) {
        status = 'healthy';
        message = 'Operativo';
      } else if (res.statusCode >= 400 && res.statusCode < 500) {
        status = 'warning';
        message = `Cliente error (${res.statusCode})`;
      } else {
        status = 'warning';
        message = `Servidor error (${res.statusCode})`;
      }
      
      resolve({
        status,
        statusCode: res.statusCode,
        message,
        responseTime: `${responseTime}ms`,
        method: method.toUpperCase(),
        url: url
      });
    });
    
    req.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      resolve({
        status: 'unhealthy',
        statusCode: null,
        message: 'No se pudo conectar',
        error: err.message,
        responseTime: `${responseTime}ms`
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        status: 'unhealthy',
        statusCode: null,
        message: 'Tiempo de espera agotado',
        responseTime: `${responseTime}ms`
      });
    });
    
    req.end();
  });
}

function checkTcp(host, port) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const socket = net.createConnection(
      { host, port: parseInt(port) },
      () => {
        const responseTime = Date.now() - startTime;
        socket.destroy();
        resolve({
          status: 'healthy',
          message: 'Puerto abierto',
          responseTime: `${responseTime}ms`
        });
      }
    );
    
    socket.on('error', (err) => {
      const responseTime = Date.now() - startTime;
      resolve({
        status: 'unhealthy',
        message: 'No se pudo conectar',
        error: err.message,
        responseTime: `${responseTime}ms`
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        status: 'unhealthy',
        message: 'Tiempo de espera agotado',
        responseTime: `${responseTime}ms`
      });
    });
    
    socket.setTimeout(5000);
  });
}
