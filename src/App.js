import React from 'react';
import './App.css';
import { Container, Tab, Segment } from 'semantic-ui-react';
import Group1Panel from './components/Group1Panel';

const panes = [
  { menuItem: '区间复合平均价法（次低价平均）', render: () => <Tab.Pane><Group1Panel/></Tab.Pane> }
];


function App() {
  return (
    <Container className="AppContainer">
      <Segment>
        <h1>Derek的秘密</h1>
      </Segment>
      <Tab panes={panes}/>
    </Container>
  );
}

export default App;
