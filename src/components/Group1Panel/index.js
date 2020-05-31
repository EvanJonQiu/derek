import React from "react";
import { Segment, Table, Input, Button } from "semantic-ui-react";
import GroupRow from "../GroupRow";
import _ from 'lodash';
import { Decimal } from 'decimal.js';
import XLSX from 'xlsx';
import {CompareDown} from "../libs/common";

const headers = [{
  title: "序号",
  name: 'index',
  width: 100,
  editable: false,
  isIndex: true
}, {
  title: "厂商",
  name: 'company',
  width: 100,
  editable: true
}, {
  title: "投标价格（万元）",
  name: 'price',
  width: 100,
  editable: true,
  isNumber: true,
}, {
  title: "算术平均值A1",
  name: 'average',
  width: 100
}, {
  title: "偏差值-20%～10%",
  name: 'offset',
  width: 100
}, {
  title: "P",
  name: 'pValue',
  width: 100
}, {
  title: "算术平均值A2",
  name: 'a2',
  width: 100
}, {
  title: "P个投标人中的最低价",
  name: 'lowerPrice',
  width: 100
}, {
  title: "基准价A3",
  name: 'a3',
  width: 100
}, {
  title: "基准价A4",
  name: 'a4',
  width: 100
}, {
  title: "最终得分",
  name: 'score',
  width: 100
}, {
  title: "权重得分",
  name: 'weightScore',
  width: 100
}, {
  title: "排名",
  name: 'rank',
  width: 100
}];

const COUNT = 30;

class Group1Panel extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: this.initData(),
      weight: 30,
      nValue: 1,
      mValue: 0.3
    }
  }

  initData = () => {
    let data = [];
    for (let i = 0; i < COUNT; i++) {
      data.push({
        index: i + 1,
        key: `ren${i + 1}`,
        company: "",
        price: 0,
        weight: 0,
        average: 0,
        offset: 0,
        pValue: 0,
        a2: 0,
        lowerPrice: 0,
        a3: 0,
        a4: 0,
        score: 0,
        weightScore: 0,
        rank: 0,
        eliminate: false
      });
    }
    return data;
  };

  onInput = (index, name, value) => {
    const {data} = this.state;
    let temp = _.cloneDeep(data);
    let items = temp.filter(item => item.index === index);
    if (items.length) {
      let it = items[0];
      if (it[name] !== value) {
        it[name] = value;
      }
      this.process1(temp);
      this.process2(temp);
      this.setState({
        data: temp
      });
    }
  }

  process1 = (data) => {
    let temp = _.cloneDeep(data);
    let count = 0;

    temp.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0)) {
        count += 1;
      }
    });
    if (count < 10) {
      data.forEach(item => {
        item.eliminate = false;
      });
    } else if (count >= 10 && count < 20) {
      temp.sort(CompareDown('price', 0));
      data.forEach(item => {
        if (item.index === temp[0].index) {
          item.eliminate = true;
        } else if (item.index === temp[count - 1].index) {
          item.eliminate = true;
        } else {
          item.eliminate = false;
        }
        
      });
    } else if (count >= 20 && count < 30) {
      temp.sort(CompareDown('price', 0));
      data.forEach(item => {
        if (item.index === temp[0].index || item.index === temp[1].index || item.index === temp[count - 1].index) {
          item.eliminate = true;
        } else {
          item.eliminate = false;
        }
      });
    } else {  // count == 30
      temp.sort(CompareDown('price', 0));
      data.forEach(item => {
        if (item.index === temp[0].index || item.index === temp[1].index || item.index === temp[2].index
            || item.index === temp[count - 1].index || item.index === temp[count - 2].index) {
          item.eliminate = true;
        } else {
          item.eliminate = false;
        }
      });
    }
  }

  process2 = (data) => {
    let total = 0;
    let count = 0;

    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        total = parseFloat(new Decimal(total).plus(new Decimal(item.price)).toFixed(2));
        count += 1;
      }
    });

    // average
    let dAverage = parseFloat(new Decimal(total).div(new Decimal(count).toFixed(2)));
    let average = parseFloat(dAverage.toFixed(2));
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        item.average = average;
      } else {
        item.average = 0;
      }
    });

    // offset
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        let temp = Decimal.sub(Decimal.div(item.price, average), 1);
        item.offset = parseFloat(temp.times(100).toFixed(2));
      } else {
        item.offset = 0;
      }
    });

    // set P and n
    let pValue = 0;
    let ret = data.filter(item => (item.company !== '' && new Decimal(item.price).gt(0)) && !item.eliminate && (new Decimal(item.offset).gt(new Decimal(-20.00)) && (new Decimal(item.offset).lt(new Decimal(10.00)))));
    pValue = ret.length;
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        if (new Decimal(item.offset).gt(new Decimal(-20.00)) && new Decimal(item.offset).lt(new Decimal(10.00))) {
          item.pValue = pValue;
        } else {
          item.pValue = 0;
        }
      } else {
        item.pValue = 0;
      }
    });

    // A2
    let a2 = 0;
    ret = data.filter(item => (item.company !== '' && new Decimal(item.price).gt(0)) && !item.eliminate && (new Decimal(item.offset).gt(new Decimal(-20.00)) && new Decimal(item.offset).lt(new Decimal(10.00))));
    if (ret.length) {
      let temp = 0;
      ret.forEach(item => {
        temp += item.price;
      });
      a2 = new Decimal(temp).div(new Decimal(ret.length)).toFixed(2);
      data.forEach(item => {
        if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
          if (new Decimal(item.offset).gt(new Decimal(-20.00)) && new Decimal(item.offset).lt(new Decimal(10.00))) {
            item.a2 = a2;
          } else {
            item.a2 = 0;
          }
        } else {
          item.a2 = 0;
        }
      });
    } else {
      data.forEach(item => {
        item.a2 = 0;
      });
    }

    // lower price
    let lowerPrice = 0;
    ret = data.filter(item => item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate && new Decimal(item.a2).gt(0));
    if (ret.length) {
      ret.sort((a, b) => {
        return parseFloat(a.price) - parseFloat(b.price); //????
      });
      lowerPrice = ret[0].price;
    }
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        if (new Decimal(item.offset).gt(new Decimal(-20.00)) && new Decimal(item.offset).lt(new Decimal(10.00))) {
          item.lowerPrice = lowerPrice;
        } else {
          item.lowerPrice = 0;
        }
      } else {
        item.lowerPrice = 0;
      }
    });

    // A3
    let a3 = ((lowerPrice + parseFloat(a2)) / 2).toFixed(2);
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        item.a3 = a3;
      } else {
        item.a3 = 0;
      }
    });

    // A4
    let outOfA1 = data.filter(item => item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate && !item.pValue);
    let isA4 = false;
    if (outOfA1.length === count) {
      isA4 = true;
      let baseA4 = 0;
      data.forEach(item => {
        item.a3 = 0;
        if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
          baseA4 += item.price;
        }
      });
      data.forEach(item => {
        if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
          item.a4 = parseFloat(new Decimal(baseA4).div(new Decimal(count)).toFixed(2));
        }
      });
    } else {
      data.forEach(item => {
        item.a4 = 0;
      });
    }

    // last score
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        let base = isA4 ? item.a4 : item.a3;

        //(100 - 100 * this.state.nValue * this.state.mValue * Math.abs(item.price - base) / base)
        let temp1 = new Decimal(item.price).sub(new Decimal(base)).abs();
        let temp2 = new Decimal(100).mul(new Decimal(this.state.nValue)).mul(new Decimal(this.state.mValue)).mul(temp1).div(new Decimal(base));
        let temp3 = new Decimal(100).sub(temp2);

        if (temp3.gt(0)) {
          item.score = parseFloat(temp3.toFixed(2));
        } else {
          item.score = 0;
        }
      } else {
        item.score = 0;
      }
    });

    // weight score
    data.forEach(item => {
      if (item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate) {
        item.weightScore = parseFloat(new Decimal(item.score).mul(new Decimal(this.state.weight).div(new Decimal(100))).toFixed(2));
      } else {
        item.weightScore = 0;
      }
    });

    // rank
    data.forEach(it => {
      it.rank = 0;
    });
    ret = data.filter(item => item.company !== '' && new Decimal(item.price).gt(0) && !item.eliminate);
    if (ret.length) {
      let newData = _.cloneDeep(ret);
      ret = newData.sort(CompareDown('score', 0));
      if (ret.length) {
        ret.forEach((item, i) => {
          let source = data.filter(it => it.index === item.index);
          if (source.length) {
            source[0].rank = i + 1;
          }
        });
      }
    }
  };

  onChange = (evt, data) => {
    const {name, value} = data;
    if (name === 'weight') {
      if (value >= 0 && value <= 100) {
        this.setState({
          [name]: parseInt(value)
        });
      }
    } else if (name === 'mValue') {
      if (new Decimal(value).gte(new Decimal(0.3)) && new Decimal(value).lte(new Decimal(0.8))) {
        this.setState({
          [name]: parseFloat(new Decimal(value).toFixed(1))
        });
      }
    }
  };

  onReset = () => {
    this.setState({
      data: this.initData(),
      weight: 30,
      nValue: 1,
      mValue: 0.3
    });
  }

  onExport = () => {
    const {data} = this.state;
    const _headers = headers.map((item, i) => Object.assign({}, { key: item.name, title: item.title, position: String.fromCharCode(65 + i) + 1 }))
      .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }), {});

    const _data = data.map((item, i) => headers.map((key, j) => Object.assign({}, { content: item[key.name], position: String.fromCharCode(65 + j) + (i + 2) })))
      .reduce((prev, next) => prev.concat(next))
      .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.content } }), {});

    const output = Object.assign({}, _headers, _data);
    const outputPos = Object.keys(output);
    const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

    const wb = {
      SheetNames: ['mySheet'],
      Sheets: {
          mySheet: Object.assign(
              {},
              output,
              {
                  '!ref': ref,
                  '!cols': [{ wpx: 45 }, { wpx: 100 }, { wpx: 200 }, { wpx: 80 }, { wpx: 150 }, { wpx: 100 }, { wpx: 300 }, { wpx: 300 }],
              },
          ),
      },
    };
    XLSX.writeFile(wb, "结果.xlsx");
  }

  renderRow = () => {
    const {data} = this.state;
    let rows = [];
    for (let i = 0; i < COUNT; i++) {
      rows.push(
        <GroupRow key={`groupRow_${i}`} index={i + 1} headers={headers} data={data[i]} onInput={this.onInput}/>
      );
    }
    return rows;
  };

  render() {
    const {weight, nValue, mValue} = this.state;
    return (
      <Segment>
        <Segment>
          <Input label='价格分权重' type="number" mix='0' max='100' step='1' name='weight'
            value={weight} onChange={this.onChange}/>
          <Input label='n值' type='number' min='1' max='10' step='1' name='nValue'
            style={{marginLeft: 10}}
            value={nValue} disabled/>
          <Input label='m值' type='number' mix='0.3' max='0.8' step='0.1' name='mValue'
            style={{marginLeft: 10}}
            value={mValue} onChange={this.onChange}/>
          <Button primary style={{marginLeft: 10}} onClick={this.onReset}>重置</Button>
          <Button positive style={{marginLeft: 10}} onClick={this.onExport}>导出</Button>
        </Segment>
        <Table celled>
          <Table.Header>
            <Table.Row>
              {
                headers.map((item, i) => {
                  return (
                    <Table.HeaderCell key={`header_${i}`} style={{textAlign: 'center'}}>{item.title}</Table.HeaderCell>
                  );
                })
              }
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.renderRow()}
          </Table.Body>
        </Table>
      </Segment>
    );
  }
}

export default Group1Panel;