import { AppRegistry } from 'react-native';
import App from '../App';

AppRegistry.registerComponent('JotChat', () => App);
AppRegistry.runApplication('JotChat', {
  rootTag: document.getElementById('root'),
});
