import type { MqttClient, OnMessageCallback } from 'mqtt';
import mqtt from 'mqtt/dist/mqtt.min.js';
import configStore from '../stores/configStore'
// import mqtt from 'mqtt'


class MQTT {
  url: string; // mqtt地址
  topic: string; //订阅地址
  client!: MqttClient;
  constructor(topic: string) {
    this.topic = topic;
    // 虽然是mqtt但是在客户端这里必须采用websock的链接方式
    this.url = configStore().wsurl;
  }

  //初始化mqtt
  init() {
    const options = {
      // 3=>3.1版本 / 4=>3.1.1版本 
      protocolVersion: 4,
      // 用户
      username: '',
      // 密码
      password: '',
      // 超时时间
      connectTimeout: 10000, 
      reconnectPeriod: 1000,
      clean: true,
      clientId: '',
      // Sec-WebSocket的头部
      wsOptions: {
        protocol: 'mqttv3.1.1', 
        key: 'mqttv3.1.1', 
      },
    };
    console.log('this.url', this.url)
    console.log('options', options)
    this.client = mqtt.connect(this.url, options);
    console.log('连接信息client', this.client)
    this.client.on('error', (error: any) => {
      console.log('连接失败', error);
    });
    this.client.on('reconnect', (error: Error) => {
      console.log('重接失败',error);
    });
  }
  //取消订阅
  unsubscribes() {
    this.client.unsubscribe(this.topic, (error: Error) => {
      if (!error) {
        console.log(this.topic, '取消订阅成功');
      } else {
        console.log(this.topic, '取消订阅失败');
      }
    });
  }
  //连接
  link() {
    this.client.on('connect', () => {
      this.client.subscribe(this.topic, { qos: 2 }, (error: any) => {
        if (!error) {
          console.log('订阅成功');
        } else {
          console.log('订阅失败');
        }
      });
    });
  }
  //收到的消息
  get(callback: OnMessageCallback) {
    this.client.on('message', callback);
  }
  //结束链接
  over() {
    this.client.end();
  }
}
export default MQTT;

