import { createApp } from 'vue';
import { initPiniaStore} from "@/stores";
import { initRouter } from '@/router';
import App from './App.vue';


const app = createApp(App);
initPiniaStore(app);
initRouter(app);
app.mount('#app');
