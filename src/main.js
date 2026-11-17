// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Button from 'element-ui/lib/button';
import ButtonGroup from 'element-ui/lib/button-group';
import Card from 'element-ui/lib/card';
import Col from 'element-ui/lib/col';
import Divider from 'element-ui/lib/divider';
import Dropdown from 'element-ui/lib/dropdown';
import DropdownItem from 'element-ui/lib/dropdown-item';
import DropdownMenu from 'element-ui/lib/dropdown-menu';
import Empty from 'element-ui/lib/empty';
import Form from 'element-ui/lib/form';
import FormItem from 'element-ui/lib/form-item';
import Image from 'element-ui/lib/image';
import Main from 'element-ui/lib/main';
import Menu from 'element-ui/lib/menu';
import MenuItem from 'element-ui/lib/menu-item';
import Message from 'element-ui/lib/message';
import Option from 'element-ui/lib/option';
import Pagination from 'element-ui/lib/pagination';
import Progress from 'element-ui/lib/progress';
import Row from 'element-ui/lib/row';
import Select from 'element-ui/lib/select';
import Tag from 'element-ui/lib/tag';
import Timeline from 'element-ui/lib/timeline';
import TimelineItem from 'element-ui/lib/timeline-item';
import Tooltip from 'element-ui/lib/tooltip';
// 按需引入组件，样式仍使用完整主题，避免遗漏依赖样式导致视觉回归
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router'
import axios from 'axios'
import i18n from './locale'

const elementComponents = [
  Button,
  ButtonGroup,
  Card,
  Col,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Empty,
  Form,
  FormItem,
  Image,
  Main,
  Menu,
  MenuItem,
  Option,
  Pagination,
  Progress,
  Row,
  Select,
  Tag,
  Timeline,
  TimelineItem,
  Tooltip
]

elementComponents.forEach(component => Vue.use(component))
Vue.prototype.$message = Message;

Vue.prototype.$axios = axios

document.documentElement.lang = i18n.locale

new Vue({
  el: '#app',
  router,
  i18n,
  components: {App},
  template: '<App/>'
})
