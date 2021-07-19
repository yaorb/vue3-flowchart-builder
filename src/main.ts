import { createApp } from 'vue'
import App from './App.vue'

import { JsPlumbToolkitVue3Plugin } from "@jsplumbtoolkit/browser-ui-vue3"

const app = createApp(App)
app.use(JsPlumbToolkitVue3Plugin)
app.mount('#app')
