  import dictStore from './dictStore'
  import configStore from './configStore'
  import publicStore from './publicStore'
	
  const stores = (app:any) => {
    app.config.globalProperties.dictStore = dictStore;
    app.config.globalProperties.configStore = configStore;
    app.config.globalProperties.publicStore = publicStore;
  }
	
  export default stores