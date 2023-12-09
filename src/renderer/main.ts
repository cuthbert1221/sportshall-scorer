import { createApp } from 'vue'
import './style.css';
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
const pinia = createPinia()

import PrimeVue from 'primevue/config';
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'


import 'primeflex/primeflex.css';


//import './assets/main.css'
import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';    

import BadgeDirective from 'primevue/badgedirective';
import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';

import './assets/custom.css'
const app = createApp(App)
app.use(pinia)
app.use(PrimeVue, { ripple: true })
app.use(ToastService);

app.component('Button', Button)
app.component('InputText', InputText)
app.component('Toast', Toast);

app.directive('badge', BadgeDirective);
app.directive('ripple', Ripple);
app.directive('styleclass', StyleClass);

app.use(router)
app.mount('#app')